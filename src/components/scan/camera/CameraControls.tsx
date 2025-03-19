
import React from "react";
import { Camera, Image, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button-custom";
import { cn } from "@/lib/utils";

interface CameraControlsProps {
  activeCamera: boolean;
  capturedImage: string | null;
  uploading: boolean;
  onCapture: () => void;
  onReset: () => void;
  onUpload: () => void;
  onSubmit: () => void;
  onOpenCamera: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  activeCamera,
  capturedImage,
  uploading,
  onCapture,
  onReset,
  onUpload,
  onSubmit,
  onOpenCamera
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-center space-x-4">
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
        
        {activeCamera && (
          <Button
            variant="blue-gradient"
            className="w-14 h-14 rounded-full"
            onClick={onCapture}
          >
            <span className="block w-10 h-10 rounded-full border-4 border-white"></span>
          </Button>
        )}
        
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
