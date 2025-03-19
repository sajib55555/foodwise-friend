
import { useRef, useEffect, useState } from "react";
import { requestCameraAccess, stopStreamTracks, setupVideoStream, CameraFacingMode, isMobileDevice, hasMultipleCameras } from "../utils";
import { useToast } from "@/hooks/use-toast";
import { applyVideoElementFixes } from "../utils/device-detection";

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
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('default');
  const [canFlipCamera, setCanFlipCamera] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if device has multiple cameras
  useEffect(() => {
    const checkCameraCapabilities = async () => {
      if (isMobileDevice()) {
        const hasMultiple = await hasMultipleCameras();
        setCanFlipCamera(hasMultiple);
      }
    };
    
    checkCameraCapabilities();
  }, []);

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
      // Immediate setup - no delay
      setupCamera();
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
  }, [activeCamera, capturedImage, facingMode]);

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
      console.log(`Setting up camera with facing mode: ${facingMode}...`);
      startCameraLoading();
      
      // Stop any existing tracks before requesting new ones
      stopAllTracks();
      
      // Request camera access with current facing mode
      const stream = await requestCameraAccess(facingMode);
      
      if (!stream) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      // Setup the video stream if the video element exists
      if (videoRef.current) {
        // Apply browser-specific fixes
        applyVideoElementFixes(videoRef.current);
        
        // Make sure video element is visible in DOM before setting up stream
        if (videoRef.current.offsetParent === null) {
          console.warn("Video element may not be visible in DOM");
        }
        
        // Apply critical styles directly
        videoRef.current.style.display = 'block';
        videoRef.current.style.visibility = 'visible';
        videoRef.current.style.opacity = '1';
        
        // Force layout recalculation
        void videoRef.current.offsetHeight;
        
        // Setup the video stream
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

  /**
   * Flips between front and back cameras
   */
  const flipCamera = () => {
    if (!canFlipCamera) return;
    
    // Toggle between front and back cameras
    const newMode: CameraFacingMode = facingMode === 'user' ? 'environment' : 'user';
    
    // Show toast notification
    toast({
      title: `Switching to ${newMode === 'user' ? 'front' : 'back'} camera`,
      duration: 2000,
    });
    
    // Set new facing mode and reset setup flags to force re-initialization
    setFacingMode(newMode);
    setupAttemptedRef.current = false;
    
    // Stop current stream before switching camera
    stopAllTracks();
    
    // Re-setup camera with new facing mode (effect will trigger due to facingMode change)
  };

  return {
    videoRef,
    streamRef,
    setupAttemptedRef,
    stopAllTracks,
    setupCamera,
    openCamera,
    flipCamera,
    canFlipCamera,
    facingMode
  };
};
