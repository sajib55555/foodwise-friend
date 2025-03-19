
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
      const handleCanPlay = () => {
        console.log("Video can play event fired");
        // Sometimes forcing a repaint can help display the video
        if (video.style.display === 'none') {
          video.style.display = 'block';
        } else {
          video.style.display = 'none';
          setTimeout(() => { 
            if (video) video.style.display = 'block';
          }, 10);
        }
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
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
