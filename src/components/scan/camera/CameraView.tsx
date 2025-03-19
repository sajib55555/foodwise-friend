
import React from "react";
import { RotateCw } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraLoading: boolean;
  cameraError: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  videoRef, 
  cameraLoading,
  cameraError
}) => {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
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
  );
};

export default CameraView;
