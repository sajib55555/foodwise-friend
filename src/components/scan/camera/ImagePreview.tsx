
import React from "react";

interface ImagePreviewProps {
  imageSrc: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageSrc }) => {
  return (
    <img 
      src={imageSrc} 
      alt="Captured" 
      className="absolute inset-0 h-full w-full object-contain bg-black"
    />
  );
};

export default ImagePreview;
