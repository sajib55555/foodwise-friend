
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useCameraState = () => {
  const [activeCamera, setActiveCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const { toast } = useToast();

  /**
   * Handles camera errors and displays appropriate messages
   */
  const handleCameraError = (errorMessage: string) => {
    console.error("Camera error:", errorMessage);
    setCameraError(errorMessage);
    setCameraLoading(false);
    
    toast({
      title: "Camera Error",
      description: "Unable to access camera. Please check your permissions and try again, or upload an image instead.",
      variant: "destructive",
    });
  };
  
  /**
   * Sets the camera as active and ready for use
   */
  const setCameraReady = () => {
    setCameraLoading(false);
    setCameraError(null);
  };
  
  /**
   * Starts the camera loading process
   */
  const startCameraLoading = () => {
    setCameraError(null);
    setCameraLoading(true);
  };
  
  return {
    activeCamera,
    setActiveCamera,
    cameraError,
    setCameraError,
    cameraLoading,
    setCameraLoading,
    handleCameraError,
    setCameraReady,
    startCameraLoading
  };
};
