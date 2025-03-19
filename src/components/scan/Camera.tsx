
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button-custom";
import { X } from "lucide-react";
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
    openCamera
  } = useCameraSetup({ 
    onCapture: (imageUrl) => {
      console.log("Camera component received captured image");
      onCapture(imageUrl);
    }
  });

  // Automatically activate camera when component mounts with a delay
  useEffect(() => {
    console.log("Camera component mounted, opening camera");
    if (!capturedImage) {
      // Add a bit more delay to ensure component is fully mounted
      setTimeout(() => {
        openCamera();
      }, 500);
    }
    
    // Ensure camera is properly cleaned up when component unmounts
    return () => {
      console.log("Camera component unmounting, cleaning up");
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-black">
        {activeCamera ? (
          <CameraView 
            videoRef={videoRef} 
            cameraLoading={cameraLoading}
            cameraError={cameraError}
          />
        ) : capturedImage ? (
          <ImagePreview imageSrc={capturedImage} />
        ) : (
          <CameraPlaceholder />
        )}
        
        <CameraError errorMessage={cameraError} />
        
        <Button
          variant="glass"
          size="icon-sm"
          className="absolute top-4 right-4 bg-black/20 text-white border-white/10 z-50"
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
      
      <CameraControls 
        activeCamera={activeCamera}
        capturedImage={capturedImage}
        uploading={uploading}
        onCapture={captureImage}
        onReset={resetCamera}
        onUpload={uploadImage}
        onSubmit={handleSubmit}
        onOpenCamera={openCamera}
      />
    </motion.div>
  );
};

export default CameraComponent;
