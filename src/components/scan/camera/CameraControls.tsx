
import React from "react";
import { Camera, Image, RotateCw, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CameraControlsProps {
  activeCamera: boolean;
  capturedImage: string | null;
  uploading: boolean;
  canFlipCamera: boolean;
  onCapture: () => void;
  onReset: () => void;
  onUpload: () => void;
  onSubmit: () => void;
  onOpenCamera: () => void;
  onFlipCamera: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  activeCamera,
  capturedImage,
  uploading,
  canFlipCamera,
  onCapture,
  onReset,
  onUpload,
  onSubmit,
  onOpenCamera,
  onFlipCamera
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-center space-x-4">
        {/* If camera is not active and no image captured, show Open Camera button */}
        {!activeCamera && !capturedImage && (
          <Button
            variant="blue-gradient"
            className="flex-1"
            onClick={onOpenCamera}
          >
            <Camera className="h-5 w-5 mr-2" />
            Open Camera
          </Button>
        )}
        
        {/* Camera controls when active */}
        {activeCamera && (
          <div className="flex items-center justify-center w-full">
            {/* Camera flip button - only shown on mobile when camera can be flipped */}
            {canFlipCamera && (
              <Button
                variant="glass"
                size="icon"
                className="bg-black/30 text-white border-white/10 mx-4"
                onClick={onFlipCamera}
                aria-label="Flip camera"
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            )}
            
            {/* Capture button */}
            <Button
              variant="blue-gradient"
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              onClick={onCapture}
              aria-label="Capture photo"
              style={{
                background: "linear-gradient(to right, #ff4800, #ff8a00)",
                boxShadow: "0 0 30px rgba(255, 72, 0, 0.8)",
                position: "relative",
                zIndex: 50
              }}
            >
              <span className="block w-20 h-20 rounded-full border-4 border-white animate-pulse"></span>
            </Button>
          </div>
        )}
        
        {/* If image is captured, show retake and analyze buttons */}
        {capturedImage && (
          <>
            <Button
              variant="outline"
              onClick={onReset}
              className="border-purple-300 hover:bg-purple-50"
            >
              <RotateCw className="h-5 w-5 mr-2 text-purple-600" />
              Retake
            </Button>
            
            <Button
              variant="green-gradient"
              onClick={onSubmit}
            >
              Analyze Food
            </Button>
          </>
        )}
        
        {/* Always show upload button when camera is not active */}
        {!activeCamera && (
          <Button
            variant={capturedImage ? "outline" : "purple-gradient"}
            className={cn(capturedImage ? "border-purple-300 hover:bg-purple-50" : "flex-1")}
            onClick={onUpload}
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
  );
};

export default CameraControls;
