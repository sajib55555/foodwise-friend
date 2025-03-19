import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseCameraSetupOptions {
  onCapture: (image: string) => void;
}

const useCameraSetup = ({ onCapture }: UseCameraSetupOptions) => {
  const [activeCamera, setActiveCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Cleanup function to stop all tracks
  const stopAllTracks = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Automatically try to start the camera when component mounts
  useEffect(() => {
    if (activeCamera && !capturedImage) {
      setupCamera();
    }
    
    // Cleanup when component unmounts
    return () => {
      stopAllTracks();
    };
  }, [activeCamera, capturedImage]);

  const setupCamera = async () => {
    try {
      setCameraError(null);
      setCameraLoading(true);
      
      // Stop any existing tracks before requesting new ones
      stopAllTracks();
      
      console.log("Attempting to access camera...");
      
      // Try different approaches to get camera access
      let stream: MediaStream | null = null;
      
      // First try: environment camera (back camera)
      try {
        console.log("Requesting camera access with environment facing mode...");
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log("Successfully accessed environment camera");
      } catch (err) {
        console.warn("Environment camera failed:", err);
        
        // Second try: any available camera
        try {
          console.log("Trying any available camera");
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
          console.log("Successfully accessed default camera");
        } catch (secondErr) {
          console.error("All camera access attempts failed:", secondErr);
          throw new Error("Could not access any camera");
        }
      }
      
      if (!stream) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log("Camera started successfully");
                setCameraLoading(false);
              })
              .catch(err => {
                console.error("Error playing video:", err);
                setCameraError("Failed to start video stream. Please try again or use the upload option.");
                setCameraLoading(false);
              });
          }
        };
      } else {
        throw new Error("Video element not found");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Failed to access camera. Please ensure camera permissions are enabled or use the upload option.");
      setCameraLoading(false);
      
      // Show a toast to help users understand what went wrong
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check your permissions and try again, or upload an image instead.",
        variant: "destructive",
      });
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Camera is not initialized properly. Please try restarting the app.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      setCameraError("Could not initialize image capture. Please try a different browser.");
      return;
    }
    
    try {
      console.log("Capturing image...");
      
      // Check if video is ready
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        setCameraError("Camera not ready yet. Please wait a moment and try again.");
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageDataUrl);
      
      // Stop camera stream
      stopAllTracks();
      setActiveCamera(false);
      
      console.log("Image captured successfully");
      toast({
        title: "Image Captured",
        description: "Food image captured successfully.",
      });
    } catch (error) {
      console.error("Error creating image:", error);
      setCameraError("Failed to capture image. Please try again or use the upload option.");
      toast({
        title: "Capture Failed",
        description: "Unable to capture image. Please try again or upload instead.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setCameraError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setUploading(false);
        toast({
          title: "Image Loaded",
          description: "Your food image has been loaded.",
        });
      };
      reader.onerror = () => {
        setUploading(false);
        setCameraError("Failed to read image file. Please try a different file.");
        toast({
          title: "Upload Failed",
          description: "Unable to load image. Please try a different file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCameraError(null);
    setActiveCamera(true);
  };

  const uploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (capturedImage) {
      console.log("Submitting captured image for analysis");
      onCapture(capturedImage);
    }
  };

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
    captureImage,
    resetCamera,
    uploadImage,
    handleSubmit,
    openCamera
  };
};

export default useCameraSetup;
