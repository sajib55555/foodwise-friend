
import React, { useEffect } from "react";
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
  // Force repainting to improve camera initialization on some devices
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Force repaint when video can play
      const handleCanPlay = () => {
        console.log("Video can play event fired");
        // Force video element to repaint
        video.style.opacity = '0';
        setTimeout(() => {
          if (video) video.style.opacity = '1';
        }, 50);
      };
      
      // Add debug events
      const handlePlaying = () => {
        console.log("Video is now playing");
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
      };
    }
  }, [videoRef]);
  
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover bg-black"
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
