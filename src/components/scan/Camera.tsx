
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button-custom";
import { X, Camera as CameraIcon } from "lucide-react";
import { motion } from "framer-motion";

import CameraView from "./camera/CameraView";
import ImagePreview from "./camera/ImagePreview";
import CameraPlaceholder from "./camera/CameraPlaceholder";
import CameraError from "./camera/CameraError";
import CameraControls from "./camera/CameraControls";
import useCameraSetup from "./camera/useCameraSetup";
import { useToast } from "@/hooks/use-toast";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
  const { toast } = useToast();
  
  const {
    activeCamera,
    capturedImage,
    uploading,
    cameraError,
    cameraLoading,
    videoRef,
    canvasRef,
    fileInputRef,
    handleFileUpload,
    captureImage,
    resetCamera,
    uploadImage,
    handleSubmit,
    openCamera,
    flipCamera,
    canFlipCamera
  } = useCameraSetup({ 
    onCapture: (imageUrl) => {
      console.log("Camera component received captured image");
      onCapture(imageUrl);
    }
  });

  // Automatically activate camera when component mounts - with minimal delay
  useEffect(() => {
    console.log("Camera component mounted, opening camera immediately");
    
    // Open camera with a minimal delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      console.log("Initial render complete, now opening camera");
      openCamera();
    }, 50);
    
    // Ensure camera is properly cleaned up when component unmounts
    return () => {
      clearTimeout(timer);
      console.log("Camera component unmounting, cleaning up");
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Add a log whenever the camera state changes
  useEffect(() => {
    console.log("Camera state:", { activeCamera, cameraLoading, cameraError, capturedImage });
  }, [activeCamera, cameraLoading, cameraError, capturedImage]);

  // Add a capture hint when camera is active
  useEffect(() => {
    if (activeCamera && !cameraLoading && !cameraError) {
      const timer = setTimeout(() => {
        toast({
          title: "Camera Ready",
          description: "Position food in frame and tap the capture button",
          duration: 3000,
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [activeCamera, cameraLoading, cameraError, toast]);

  return (
    <motion.div 
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative bg-black rounded-3xl overflow-hidden" style={{ height: "300px" }}>
        {/* Improved targeting frame with instructions */}
        {activeCamera && !cameraLoading && !cameraError && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/50 rounded-lg shadow-lg flex flex-col items-center justify-center">
                <CameraIcon className="h-8 w-8 text-white/40 mb-2" />
                <p className="text-white/70 text-xs text-center px-4">
                  Center food in frame<br/>for best results
                </p>
              </div>
            </div>
          </div>
        )}
      
        {activeCamera && (
          <CameraView 
            videoRef={videoRef} 
            cameraLoading={cameraLoading}
            cameraError={cameraError}
          />
        )}
        
        {!activeCamera && capturedImage && (
          <ImagePreview imageSrc={capturedImage} />
        )}
        
        {!activeCamera && !capturedImage && (
          <>
            <CameraPlaceholder />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                variant="purple-gradient"
                className="px-6 py-3 rounded-full shadow-purple"
                onClick={openCamera}
              >
                Tap to Start Camera
              </Button>
            </div>
          </>
        )}
        
        <CameraError errorMessage={cameraError} />
        
        <Button
          variant="glass"
          size="icon-sm"
          className="absolute top-4 right-4 bg-black/30 text-white border-white/10 z-50 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" width="1280" height="720" />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <CameraControls 
        activeCamera={activeCamera}
        capturedImage={capturedImage}
        uploading={uploading}
        canFlipCamera={canFlipCamera}
        onCapture={captureImage}
        onReset={resetCamera}
        onUpload={uploadImage}
        onSubmit={handleSubmit}
        onOpenCamera={openCamera}
        onFlipCamera={flipCamera}
      />
    </motion.div>
  );
};

export default CameraComponent;
