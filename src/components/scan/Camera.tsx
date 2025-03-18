
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button-custom";
import { Camera, Image, X, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const [activeCamera, setActiveCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Setup camera when component mounts
    if (activeCamera) {
      setupCamera();
    }

    // Cleanup when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [activeCamera]);

  const setupCamera = async () => {
    try {
      const constraints = { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        setActiveCamera(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setActiveCamera(true);
  };

  const uploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-black">
        {activeCamera ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white/50 rounded-lg w-[85%] h-[60%] border-dashed"></div>
            </div>
          </>
        ) : capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-4">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Camera Access</p>
              <p className="text-sm opacity-70">Please enable camera access or upload an image</p>
            </div>
          </div>
        )}
        
        <Button
          variant="glass"
          size="icon-sm"
          className="absolute top-4 right-4 bg-black/20 text-white border-white/10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="p-4 space-y-4">
        <div className="flex justify-center space-x-4">
          {!activeCamera && !capturedImage && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => setActiveCamera(true)}
            >
              <Camera className="h-5 w-5 mr-2" />
              Open Camera
            </Button>
          )}
          
          {activeCamera && (
            <Button
              variant="default"
              className="w-14 h-14 rounded-full"
              onClick={captureImage}
            >
              <span className="block w-10 h-10 rounded-full border-4 border-white"></span>
            </Button>
          )}
          
          {capturedImage && (
            <>
              <Button
                variant="outline"
                onClick={resetCamera}
              >
                <RotateCw className="h-5 w-5 mr-2" />
                Retake
              </Button>
              
              <Button
                variant="default"
                onClick={handleSubmit}
              >
                Analyze Food
              </Button>
            </>
          )}
          
          {!activeCamera && (
            <Button
              variant={capturedImage ? "outline" : "default"}
              className={cn(capturedImage ? "" : "flex-1")}
              onClick={uploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <RotateCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Image className="h-5 w-5 mr-2" />
              )}
              Upload Image
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CameraComponent;
