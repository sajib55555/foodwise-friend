
import { useEffect, useRef } from "react";
import { requestCameraAccess, stopStreamTracks, setupVideoStream } from "./utils/cameraUtils";
import { useImageCapture } from "./hooks/useImageCapture";
import { useFileUpload } from "./hooks/useFileUpload";
import { useCameraState } from "./hooks/useCameraState";

interface UseCameraSetupOptions {
  onCapture: (image: string) => void;
}

const useCameraSetup = ({ onCapture }: UseCameraSetupOptions) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Use our new composable hooks
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
    captureImage,
    processImage
  } = useImageCapture({ onCapture });
  
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
    stopStreamTracks(streamRef.current);
    streamRef.current = null;
  };

  // Setup the camera when activeCamera state changes
  useEffect(() => {
    if (activeCamera && !capturedImage) {
      setupCamera();
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
    try {
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
    if (videoRef.current) {
      const imageUrl = captureImage(videoRef.current);
      if (imageUrl) {
        stopAllTracks();
        setActiveCamera(false);
      }
    } else {
      setCameraError("Camera not initialized properly. Please refresh and try again.");
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
