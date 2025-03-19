
import React, { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { applyVideoElementFixes } from "./utils/device-detection";

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
      
      console.log("CameraView mounted, setting up video element");
      
      // Apply browser-specific fixes and critical styles
      applyVideoElementFixes(video);
      
      // Force repaint when video can play
      const handleCanPlay = () => {
        console.log("Video can play event fired");
        // Ensure video is visible
        if (video) {
          applyVideoElementFixes(video);
          // Force layout recalculation
          void video.offsetHeight;
        }
      };
      
      // Add debug events
      const handlePlaying = () => {
        console.log("Video is now playing with dimensions:", video.videoWidth, "x", video.videoHeight);
        // Make video visible when playing starts
        if (video) {
          applyVideoElementFixes(video);
          // Force layout recalculation
          void video.offsetHeight;
        }
      };
      
      // Handle video errors
      const handleError = (e: Event) => {
        console.error("Video element error:", e);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
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
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          zIndex: 10,
          backgroundColor: '#000'
        }}
        className="absolute inset-0 h-full w-full object-cover bg-black"
      />
      {cameraLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center text-white">
            <RotateCw className="h-10 w-10 mx-auto mb-4 animate-spin text-emerald-500" />
            <p>Starting camera...</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="border-2 border-emerald-500/80 rounded-lg w-[85%] h-[60%] border-dashed"></div>
      </div>
    </>
  );
};

export default CameraView;
