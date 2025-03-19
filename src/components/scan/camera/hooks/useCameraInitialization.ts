
import { useRef, useEffect } from "react";
import { requestCameraAccess, stopStreamTracks, setupVideoStream } from "../utils";
import { useToast } from "@/hooks/use-toast";

interface UseCameraInitializationOptions {
  activeCamera: boolean;
  capturedImage: string | null;
  setCameraReady: () => void;
  startCameraLoading: () => void;
  handleCameraError: (errorMessage: string) => void;
  setActiveCamera: (active: boolean) => void;
}

export const useCameraInitialization = ({
  activeCamera,
  capturedImage,
  setCameraReady,
  startCameraLoading,
  handleCameraError,
  setActiveCamera
}: UseCameraInitializationOptions) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const setupAttemptedRef = useRef<boolean>(false);
  const { toast } = useToast();

  // Cleanup function to stop all tracks
  const stopAllTracks = () => {
    console.log("Stopping all camera tracks");
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
  };

  // Setup the camera when activeCamera state changes to true
  useEffect(() => {
    let setupTimer: number;
    
    if (activeCamera && !capturedImage) {
      console.log("Camera activated, setting up...");
      // We'll add a short delay to ensure DOM is ready
      setupTimer = window.setTimeout(() => {
        setupCamera();
      }, 300);
    } else if (!activeCamera && streamRef.current) {
      console.log("Camera deactivated, stopping tracks");
      stopAllTracks();
    }
    
    // Cleanup when component unmounts or activeCamera changes
    return () => {
      clearTimeout(setupTimer);
      if (!activeCamera) {
        stopAllTracks();
      }
    };
  }, [activeCamera, capturedImage]);

  /**
   * Initializes the camera and prepares the video stream
   */
  const setupCamera = async () => {
    // Prevent multiple setup attempts
    if (setupAttemptedRef.current) {
      console.log("Camera setup already attempted, waiting...");
      return;
    }
    
    setupAttemptedRef.current = true;
    
    try {
      console.log("Setting up camera...");
      startCameraLoading();
      
      // Stop any existing tracks before requesting new ones
      stopAllTracks();
      
      // Add a small delay to ensure previous tracks are fully stopped
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Request camera access
      const stream = await requestCameraAccess();
      
      if (!stream) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      // Setup the video stream if the video element exists
      if (videoRef.current) {
        setupVideoStream(
          videoRef.current,
          stream,
          () => {
            setCameraReady();
            setTimeout(() => {
              setupAttemptedRef.current = false; // Reset for potential retries
            }, 500);
          },
          (errorMessage) => {
            handleCameraError(errorMessage);
            setupAttemptedRef.current = false; // Reset for potential retries
          }
        );
      } else {
        throw new Error("Video element not found");
      }
    } catch (error) {
      setupAttemptedRef.current = false; // Reset for potential retries
      let errorMessage = "Failed to access camera. Please ensure camera permissions are enabled or use the upload option.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      handleCameraError(errorMessage);
    }
  };

  /**
   * Opens the camera for capturing
   */
  const openCamera = () => {
    setupAttemptedRef.current = false;
    setActiveCamera(true);
  };

  return {
    videoRef,
    streamRef,
    setupAttemptedRef,
    stopAllTracks,
    setupCamera,
    openCamera
  };
};
