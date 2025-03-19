
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseImageCaptureProps {
  onCapture: (image: string) => void;
}

export const useImageCapture = ({ onCapture }: UseImageCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  /**
   * Captures an image from the video stream
   */
  const captureImage = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement || !canvasRef.current) {
      toast({
        title: "Capture Error",
        description: "Camera is not initialized properly. Please try restarting the app.",
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
      
      // Make sure the video has loaded and has dimensions
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        toast({
          title: "Camera Not Ready",
          description: "Camera not ready yet. Please wait a moment and try again.",
          variant: "destructive",
        });
        return null;
      }
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL - use JPEG format for better compatibility
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageDataUrl);
      
      console.log("Image captured successfully");
      toast({
        title: "Image Captured",
        description: "Food image captured successfully.",
      });
      
      // Save to state and return the image URL
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
  
  return {
    capturedImage,
    setCapturedImage,
    canvasRef,
    captureImage
  };
};
