
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
    if (activeCamera && !capturedImage) {
      setupCamera();
    }
    
    // Cleanup when component unmounts or when activeCamera changes to false
    return () => {
      if (!activeCamera) {
        stopAllTracks();
      }
    };
  }, [activeCamera, capturedImage]);

  /**
   * Initializes the camera and prepares the video stream
   */
  const setupCamera = async () => {
    try {
      console.log("Setting up camera...");
      startCameraLoading();
      
      // Stop any existing tracks before requesting new ones
      stopAllTracks();
      
      const stream = await requestCameraAccess();
      
      if (!stream) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        setupVideoStream(
          videoRef.current,
          stream,
          setCameraReady,
          (errorMessage) => handleCameraError(errorMessage)
        );
      } else {
        throw new Error("Video element not found");
      }
    } catch (error) {
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
    
    // Check if video element is ready and playing
    if (videoRef.current.readyState !== 4) {
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
      stopAllTracks();
      setActiveCamera(false);
    }
  };

  /**
   * Resets the camera state and starts a new camera session
   */
  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
    setActiveCamera(true);
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
