
import React from "react";
import { Button } from "@/components/ui/button-custom";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import CameraView from "./camera/CameraView";
import ImagePreview from "./camera/ImagePreview";
import CameraPlaceholder from "./camera/CameraPlaceholder";
import CameraError from "./camera/CameraError";
import CameraControls from "./camera/CameraControls";
import useCameraSetup from "./camera/useCameraSetup";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onClose }) => {
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
  } = useCameraSetup({ onCapture });

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
