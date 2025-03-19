
import { useEffect, useRef } from "react";
import { requestCameraAccess, stopStreamTracks, setupVideoStream } from "./utils/cameraUtils";
import { useImageCapture } from "./hooks/useImageCapture";
import { useFileUpload } from "./hooks/useFileUpload";
import { useCameraState } from "./hooks/useCameraState";
import { useToast } from "@/hooks/use-toast";

interface UseCameraSetupOptions {
  onCapture: (image: string) => void;
}

const useCameraSetup = ({ onCapture }: UseCameraSetupOptions) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const setupAttemptedRef = useRef<boolean>(false);
  const { toast } = useToast();
  
  // Use our composable hooks
  const {
    activeCamera,
    setActiveCamera,
    cameraError,
    setCameraError,
    cameraLoading,
    setCameraLoading,
    handleCameraError,
    setCameraReady,
    startCameraLoading
  } = useCameraState();
  
  const {
    capturedImage,
    setCapturedImage,
    canvasRef,
    captureImage
  } = useImageCapture({ 
    onCapture: (imageUrl) => {
      console.log("Image captured callback, processing image");
      // Don't call onCapture directly here - it will be handled by handleSubmit
      setCapturedImage(imageUrl);
    } 
  });
  
  const {
    uploading,
    fileInputRef,
    handleFileUpload,
    uploadImage
  } = useFileUpload({
    onImageLoaded: (imageUrl) => {
      setCapturedImage(imageUrl);
    }
  });

  // Cleanup function to stop all tracks
  const stopAllTracks = () => {
    console.log("Stopping all camera tracks");
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
  };

  // Setup the camera when activeCamera state changes
  useEffect(() => {
    // Only setup camera if activeCamera is true and no image is captured yet
    if (activeCamera && !capturedImage) {
      setupCamera();
    } else if (!activeCamera && streamRef.current) {
      // If camera becomes inactive, stop tracks
      stopAllTracks();
    }
    
    // Cleanup when component unmounts
    return () => {
      stopAllTracks();
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
      
      const stream = await requestCameraAccess();
      
      if (!stream) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        setupVideoStream(
          videoRef.current,
          stream,
          () => {
            setCameraReady();
            setupAttemptedRef.current = false; // Reset for potential retries
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
   * Captures an image from the current video stream
   */
  const handleCaptureImage = () => {
    console.log("Attempting to capture image");
    if (!videoRef.current || !streamRef.current) {
      setCameraError("Camera not initialized properly. Please refresh and try again.");
      toast({
        title: "Camera Error",
        description: "Camera is not ready. Please make sure camera permissions are granted.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if video element is ready and has dimensions
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error("Video not ready for capture. Dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
      toast({
        title: "Camera Not Ready",
        description: "Camera is still initializing. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }
    
    // Try to capture the image
    const imageUrl = captureImage(videoRef.current);
    if (imageUrl) {
      console.log("Successfully captured image, stopping camera");
      stopAllTracks();
      setActiveCamera(false);
    } else {
      console.error("Failed to capture image");
    }
  };

  /**
   * Resets the camera state and starts a new camera session
   */
  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
    setActiveCamera(true);
    setupAttemptedRef.current = false; // Reset for retry
  };

  /**
   * Submits the captured image for processing
   */
  const handleSubmit = () => {
    if (capturedImage) {
      console.log("Submitting captured image for analysis");
      onCapture(capturedImage);
    } else {
      toast({
        title: "No Image",
        description: "Please capture or upload an image first.",
        variant: "destructive",
      });
    }
  };

  /**
   * Opens the camera for capturing
   */
  const openCamera = () => {
    setCameraError(null);
    setActiveCamera(true);
    setupAttemptedRef.current = false; // Reset for retry
  };

  return {
    activeCamera,
    capturedImage,
    uploading,
    cameraError,
    cameraLoading,
    videoRef,
    canvasRef,
    fileInputRef,
    handleFileUpload,
    captureImage: handleCaptureImage,
    resetCamera,
    uploadImage,
    handleSubmit,
    openCamera
  };
};

export default useCameraSetup;
