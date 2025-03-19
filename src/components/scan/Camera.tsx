
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button-custom";
import { Camera, Image, X, RotateCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const [activeCamera, setActiveCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Automatically try to start the camera when component mounts
  useEffect(() => {
    if (!capturedImage) {
      setActiveCamera(true);
    }
  }, [capturedImage]);

  // Setup camera when activeCamera state changes
  useEffect(() => {
    if (activeCamera) {
      setupCamera();
    }

    // Cleanup when component unmounts or camera is deactivated
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
      setCameraError(null);
      setCameraLoading(true);
      
      // Request camera access with proper constraints
      const constraints = { 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log("Camera started successfully");
                setCameraLoading(false);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError("Failed to start video stream. Please try again.");
                setCameraLoading(false);
              });
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Failed to access camera. Please ensure camera permissions are enabled.");
      setCameraLoading(false);
      
      // Show a toast to help users understand what went wrong
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check your permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        try {
          console.log("Capturing image...");
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setCapturedImage(imageDataUrl);
          
          // Stop camera stream
          const stream = video.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          setActiveCamera(false);
          
          console.log("Image captured successfully");
          toast({
            title: "Image Captured",
            description: "Food image captured successfully.",
          });
        } catch (error) {
          console.error("Error creating image:", error);
          setCameraError("Failed to capture image. Please try again.");
          toast({
            title: "Capture Failed",
            description: "Unable to capture image. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setCameraError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setUploading(false);
        toast({
          title: "Image Loaded",
          description: "Your food image has been loaded.",
        });
      };
      reader.onerror = () => {
        setUploading(false);
        setCameraError("Failed to read image file. Please try a different file.");
        toast({
          title: "Upload Failed",
          description: "Unable to load image. Please try a different file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
    setActiveCamera(true);
  };

  const uploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (capturedImage) {
      console.log("Submitting captured image for analysis");
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
            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <RotateCw className="h-10 w-10 mx-auto mb-4 animate-spin text-emerald-500" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-emerald-500/50 rounded-lg w-[85%] h-[60%] border-dashed"></div>
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
        
        {cameraError && (
          <div className="absolute bottom-4 left-0 right-0 mx-4 bg-red-500/80 text-white p-3 rounded-md text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{cameraError}</span>
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
              variant="blue-gradient"
              className="flex-1"
              onClick={() => setActiveCamera(true)}
            >
              <Camera className="h-5 w-5 mr-2" />
              Open Camera
            </Button>
          )}
          
          {activeCamera && (
            <Button
              variant="blue-gradient"
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
                className="border-purple-300 hover:bg-purple-50"
              >
                <RotateCw className="h-5 w-5 mr-2 text-purple-600" />
                Retake
              </Button>
              
              <Button
                variant="green-gradient"
                onClick={handleSubmit}
              >
                Analyze Food
              </Button>
            </>
          )}
          
          {!activeCamera && (
            <Button
              variant={capturedImage ? "outline" : "purple-gradient"}
              className={cn(capturedImage ? "border-purple-300 hover:bg-purple-50" : "flex-1")}
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
