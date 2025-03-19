
import React, { useEffect, useState } from "react";
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
  const [videoVisible, setVideoVisible] = useState(true);
  
  // Force repainting to improve camera initialization on some devices
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Enhanced debugging and visibility
      console.log("CameraView mounted, setting up video element");
      
      // Force repaint when video can play
      const handleCanPlay = () => {
        console.log("Video can play event fired");
        // Ensure video is visible
        setVideoVisible(true);
      };
      
      // Add debug events
      const handlePlaying = () => {
        console.log("Video is now playing with dimensions:", video.videoWidth, "x", video.videoHeight);
        // Ensure video is visible when playing starts
        setVideoVisible(true);
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
          display: videoVisible ? 'block' : 'none'
        }}
        className="absolute inset-0 h-full w-full object-cover bg-black z-10"
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
