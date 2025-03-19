
import React from "react";
import { AlertCircle } from "lucide-react";

interface CameraErrorProps {
  errorMessage: string | null;
}

const CameraError: React.FC<CameraErrorProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="absolute bottom-4 left-0 right-0 mx-4 bg-red-500/80 text-white p-3 rounded-md text-sm flex items-center">
      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
      <span>{errorMessage}</span>
    </div>
  );
};

export default CameraError;
