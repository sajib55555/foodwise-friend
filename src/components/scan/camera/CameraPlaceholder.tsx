
import React from "react";
import { Camera } from "lucide-react";

const CameraPlaceholder: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div className="text-center text-white p-4">
        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No Camera Access</p>
        <p className="text-sm opacity-70">Please enable camera access or upload an image</p>
      </div>
    </div>
  );
};

export default CameraPlaceholder;
