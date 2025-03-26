
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
   * Captures an image from the current video stream with optimized performance
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
    
    // Speed optimization: Check if video element is ready without waiting
    if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
      const imageUrl = captureImage(videoElement);
      if (imageUrl) {
        console.log("Successfully captured image immediately, stopping camera");
        stopAllTracks();
        setActiveCamera(false);
        captureAttemptedRef.current = false;
        return;
      }
    }
    
    // If immediate capture failed, try with a minimal delay
    setTimeout(() => {
      if (videoElement && videoElement.videoWidth > 0) {
        console.log("Retrying capture after minimal delay, dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
        const imageUrl = captureImage(videoElement);
        if (imageUrl) {
          console.log("Successfully captured image after retry, stopping camera");
          stopAllTracks();
          setActiveCamera(false);
        } else {
          toast({
            title: "Capture Failed",
            description: "Failed to capture image. Please try again with better lighting.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Camera Not Ready",
          description: "Camera is still initializing. Please wait a moment and try again.",
          variant: "destructive",
        });
      }
      captureAttemptedRef.current = false;
    }, 200); // Reduced from 500ms to 200ms for faster capture
  };

  /**
   * Captures an image from the video element with optimized quality settings
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
      
      // Set canvas dimensions to a reasonable size for analysis
      // Using a slightly smaller size than the video for faster processing
      const MAX_WIDTH = 1024;
      const MAX_HEIGHT = 1024;
      
      let width = videoElement.videoWidth;
      let height = videoElement.videoHeight;
      
      // Resize if necessary (maintain aspect ratio)
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
      
      if (height > MAX_HEIGHT) {
        width = (width * MAX_HEIGHT) / height;
        height = MAX_HEIGHT;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw video frame to canvas with the new dimensions
      context.drawImage(videoElement, 0, 0, width, height);
      
      // Convert canvas to data URL - use JPEG format with slightly reduced quality for faster analysis
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Image captured with optimized dimensions", width, "x", height);
      
      // Save to state
      setCapturedImage(imageDataUrl);
      
      // Notify success
      toast({
        title: "Image Captured",
        description: "Food image captured successfully. Ready for analysis.",
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
