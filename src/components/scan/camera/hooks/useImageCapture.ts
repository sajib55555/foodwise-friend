
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
      
      // Check if video is ready
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        toast({
          title: "Camera Not Ready",
          description: "Camera not ready yet. Please wait a moment and try again.",
          variant: "destructive",
        });
        return null;
      }
      
      // Set canvas dimensions to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageDataUrl);
      
      console.log("Image captured successfully");
      toast({
        title: "Image Captured",
        description: "Food image captured successfully.",
      });
      
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
   * Processes a captured image and notifies parent component
   */
  const processImage = (imageUrl: string | null) => {
    if (imageUrl) {
      onCapture(imageUrl);
    }
  };
  
  return {
    capturedImage,
    setCapturedImage,
    canvasRef,
    captureImage,
    processImage
  };
};
