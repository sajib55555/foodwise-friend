
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCameraState } from "./hooks/useCameraState";
import { useFileUpload } from "./hooks/useFileUpload";
import { useCameraInitialization } from "./hooks/useCameraInitialization";
import { useCameraCapture } from "./hooks/useCameraCapture";

interface UseCameraSetupOptions {
  onCapture: (image: string) => void;
}

const useCameraSetup = ({ onCapture }: UseCameraSetupOptions) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  // Initialize camera capture functionality
  const {
    capturedImage,
    setCapturedImage,
    canvasRef,
    captureAttemptedRef,
    handleCaptureImage,
    resetCamera: resetCaptureState
  } = useCameraCapture({ 
    onCapture: (imageUrl) => {
      console.log("Image captured callback, processing image");
      // Don't call onCapture directly here - it will be handled by handleSubmit
      setCapturedImage(imageUrl);
    },
    setActiveCamera
  });
  
  // Initialize camera hardware
  const {
    videoRef,
    streamRef,
    setupAttemptedRef,
    stopAllTracks,
    openCamera: initializeCamera,
    flipCamera,
    canFlipCamera
  } = useCameraInitialization({
    activeCamera,
    capturedImage,
    setCameraReady,
    startCameraLoading,
    handleCameraError,
    setActiveCamera
  });
  
  // Initialize file upload functionality
  const {
    uploading,
    handleFileUpload,
    uploadImage
  } = useFileUpload({
    onImageLoaded: (imageUrl) => {
      setCapturedImage(imageUrl);
    }
  });

  /**
   * Captures an image from the current video stream
   */
  const captureImage = () => {
    handleCaptureImage(videoRef.current, streamRef, stopAllTracks);
  };

  /**
   * Resets the camera state and starts a new camera session
   */
  const resetCamera = () => {
    resetCaptureState();
    setCameraError(null);
    setupAttemptedRef.current = false;
    captureAttemptedRef.current = false;
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
    setupAttemptedRef.current = false;
    captureAttemptedRef.current = false;
    initializeCamera();
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
    captureImage,
    resetCamera,
    uploadImage,
    handleSubmit,
    openCamera,
    flipCamera,
    canFlipCamera
  };
};

export default useCameraSetup;
