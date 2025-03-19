
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
    <div className="p-6 space-y-6">
      {/* If camera is not active and no image captured, show Open Camera button */}
      {!activeCamera && !capturedImage && (
        <Button
          variant="purple-gradient"
          className="w-full rounded-full shadow-purple h-14 transition-all hover:shadow-purple-lg text-base"
          onClick={onOpenCamera}
        >
          <Camera className="h-5 w-5 mr-2" />
          Open Camera
        </Button>
      )}
      
      {/* Camera controls when active */}
      {activeCamera && (
        <div className="flex items-center justify-center w-full gap-8 mt-2">
          {/* Camera flip button - only shown on mobile when camera can be flipped */}
          {canFlipCamera && (
            <Button
              variant="glass"
              size="icon-sm"
              className="bg-black/20 text-white border-white/10 rounded-full shadow-lg hover:scale-105 transition-transform"
              onClick={onFlipCamera}
              aria-label="Flip camera"
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          )}
          
          {/* Capture button */}
          <Button
            variant="blue-gradient"
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            onClick={onCapture}
            aria-label="Capture photo"
            style={{
              background: "linear-gradient(to right, #ff6b00, #ff9a56)",
              boxShadow: "0 0 30px rgba(255, 107, 0, 0.6)",
              position: "relative",
              zIndex: 50
            }}
          >
            <span className="block w-16 h-16 rounded-full border-2 border-white animate-pulse"></span>
          </Button>
        </div>
      )}
      
      {/* If image is captured, show retake and analyze buttons */}
      {capturedImage && (
        <div className="flex flex-col sm:flex-row w-full gap-4">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full sm:flex-1 rounded-full border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-purple-50 shadow-sm hover:shadow-md transition-all"
          >
            <RotateCw className="h-5 w-5 mr-2 text-purple-600" />
            Retake
          </Button>
          
          <Button
            variant="purple-gradient"
            className="w-full sm:flex-1 rounded-full shadow-purple hover:shadow-purple-lg transition-all"
            onClick={onSubmit}
          >
            Analyze Food
          </Button>
        </div>
      )}
      
      {/* Always show upload button when camera is not active */}
      {!activeCamera && (
        <Button
          variant={capturedImage ? "outline" : "purple-gradient"}
          className={cn(
            "w-full rounded-full py-3 h-14 text-base",
            capturedImage 
              ? "border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-purple-50 shadow-sm hover:shadow-md transition-all" 
              : "shadow-purple hover:shadow-purple-lg transition-all"
          )}
          onClick={onUpload}
          disabled={uploading}
        >
          {uploading ? (
            <RotateCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Image className="h-5 w-5 mr-2" />
          )}
          Upload from Device
        </Button>
      )}
    </div>
  );
};

export default CameraControls;
