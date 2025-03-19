
import { useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseCameraCaptureOptions {
  onCapture: (image: string) => void;
  setActiveCamera: (active: boolean) => void;
}

export const useCameraCapture = ({ 
  onCapture,
  setActiveCamera
}: UseCameraCaptureOptions) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureAttemptedRef = useRef<boolean>(false);
  const { toast } = useToast();

  /**
   * Captures an image from the current video stream
   */
  const handleCaptureImage = (videoElement: HTMLVideoElement | null, streamRef: React.MutableRefObject<MediaStream | null>, stopAllTracks: () => void) => {
    console.log("Attempting to capture image");
    
    // Prevent rapid multiple capture attempts
    if (captureAttemptedRef.current) {
      console.log("Capture recently attempted, please wait");
      return;
    }
    
    captureAttemptedRef.current = true;
    
    if (!videoElement || !streamRef.current) {
      toast({
        title: "Camera Error",
        description: "Camera is not ready. Please make sure camera permissions are granted.",
        variant: "destructive",
      });
      captureAttemptedRef.current = false;
      return;
    }
    
    // Check if video element is ready and has dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.error("Video not ready for capture. Dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
      
      // Try to get video dimensions and retry
      setTimeout(() => {
        if (videoElement && videoElement.videoWidth > 0) {
          console.log("Retrying capture after delay, dimensions now:", videoElement.videoWidth, "x", videoElement.videoHeight);
          const imageUrl = captureImage(videoElement);
          if (imageUrl) {
            console.log("Successfully captured image after retry, stopping camera");
            stopAllTracks();
            setActiveCamera(false);
          }
        } else {
          toast({
            title: "Camera Not Ready",
            description: "Camera is still initializing. Please wait a moment and try again.",
            variant: "destructive",
          });
        }
        captureAttemptedRef.current = false;
      }, 500);
      
      return;
    }
    
    // Try to capture the image
    const imageUrl = captureImage(videoElement);
    if (imageUrl) {
      console.log("Successfully captured image, stopping camera");
      stopAllTracks();
      setActiveCamera(false);
    } else {
      console.error("Failed to capture image");
      toast({
        title: "Capture Failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
    
    // Reset the capture attempt flag after a delay
    setTimeout(() => {
      captureAttemptedRef.current = false;
    }, 1000);
  };

  /**
   * Captures an image from the video element
   */
  const captureImage = (videoElement: HTMLVideoElement): string | null => {
    if (!videoElement || !canvasRef.current) {
      console.error("Cannot capture: video or canvas element not available");
      toast({
        title: "Capture Error",
        description: "Camera is not initialized properly. Please try restarting the app.",
        variant: "destructive",
      });
      return null;
    }

    // Verify video is playing and has dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0 || videoElement.readyState < 2) {
      console.error("Video not ready for capture. ReadyState:", videoElement.readyState, "Dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
      toast({
        title: "Camera Not Ready",
        description: "Camera not ready yet. Please wait a moment and try again.",
        variant: "destructive",
      });
      return null;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      toast({
        title: "Capture Error",
        description: "Could not initialize image capture. Please try a different browser.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Capturing image...");
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL - use JPEG format for better compatibility
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Image captured with dimensions", canvas.width, "x", canvas.height);
      
      // Save to state
      setCapturedImage(imageDataUrl);
      
      // Notify success
      toast({
        title: "Image Captured",
        description: "Food image captured successfully.",
      });
      
      // Call the callback with the image
      onCapture(imageDataUrl);
      return imageDataUrl;
    } catch (error) {
      console.error("Error creating image:", error);
      toast({
        title: "Capture Failed",
        description: "Unable to capture image. Please try again or upload instead.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Resets the camera state and starts a new camera session
   */
  const resetCamera = () => {
    setCapturedImage(null);
    captureAttemptedRef.current = false;
  };

  return {
    capturedImage,
    setCapturedImage,
    canvasRef,
    captureAttemptedRef,
    handleCaptureImage,
    resetCamera
  };
};
