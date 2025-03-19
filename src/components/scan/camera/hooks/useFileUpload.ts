
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseFileUploadProps {
  onImageLoaded: (imageUrl: string) => void;
}

export const useFileUpload = ({ onImageLoaded }: UseFileUploadProps) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  /**
   * Handles file selection from the file input
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        onImageLoaded(imageUrl);
        setUploading(false);
        toast({
          title: "Image Loaded",
          description: "Your food image has been loaded.",
        });
      };
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload Failed",
          description: "Unable to load image. Please try a different file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  /**
   * Triggers the file input click event
   */
  const uploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return {
    uploading,
    fileInputRef,
    handleFileUpload,
    uploadImage
  };
};
