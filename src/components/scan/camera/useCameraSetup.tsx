
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
    // Provide user feedback that we're processing the image
    toast({
      title: "Capturing image...",
      description: "Hold still for best results",
      duration: 1500,
    });
    
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
   * Optimizes the image for more accurate processing and analysis
   * Adjusts image size and quality for optimal AI model analysis
   */
  const optimizeImageForProcessing = (imageData: string): string => {
    if (!imageData || !imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // Create a temporary canvas to resize the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const img = new Image();
    
    try {
      // Set maximum dimensions - moderate size for better quality analysis
      const MAX_WIDTH = 800; // Increased from 500 for more details
      const MAX_HEIGHT = 800; // Increased from 500 for more details
      
      // Set image source and ensure it's loaded
      img.src = imageData;
      
      if (!img.complete) {
        // If image is not loaded yet, we need to wait
        console.log("Image not loaded yet, using original");
        return imageData;
      }
      
      // Calculate new dimensions while preserving aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      // Set canvas dimensions
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Draw resized image
      tempCtx?.drawImage(img, 0, 0, width, height);
      
      // Return optimized image with moderate quality for better analysis
      return tempCanvas.toDataURL('image/jpeg', 0.85); // Increased quality from 0.6
    } catch (error) {
      console.error('Error optimizing image:', error);
      return imageData; // Return original if optimization fails
    }
  };

  /**
   * Submits the captured image for processing
   */
  const handleSubmit = () => {
    if (capturedImage) {
      console.log("Submitting captured image for analysis");
      
      // Optimize image before analysis to improve accuracy
      const optimizedImage = optimizeImageForProcessing(capturedImage);
      console.log("Image optimized for processing. Original size:", capturedImage.length, "Optimized size:", optimizedImage.length);
      
      toast({
        title: "Processing Food Image",
        description: "Analyzing food items for nutritional data...",
        variant: "default",
      });
      
      // Add a small delay to ensure UI updates
      setTimeout(() => {
        onCapture(optimizedImage);
      }, 300);
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
