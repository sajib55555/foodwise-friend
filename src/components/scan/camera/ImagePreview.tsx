
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewProps {
  imageSrc: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageSrc }) => {
  return (
    <div className="relative w-full h-full">
      <AspectRatio ratio={4/3} className="w-full h-full">
        <img 
          src={imageSrc} 
          alt="Captured food" 
          className="h-full w-full object-cover"
          style={{ maxHeight: "300px" }} // Ensure image preview matches camera height
        />
      </AspectRatio>
    </div>
  );
};

export default ImagePreview;
