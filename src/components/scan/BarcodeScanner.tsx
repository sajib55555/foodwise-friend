
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { AlertCircle, RefreshCw, Barcode } from 'lucide-react';
import { motion } from 'framer-motion';

// This is a simplified barcode scanner. In a production app, you would use
// a library like quagga.js or zxing for more robust barcode recognition
const BarcodeScanner: React.FC<{
  onDetected: (code: string) => void;
  onReset: () => void;
}> = ({ onDetected, onReset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setError(null);
        const constraints = {
          video: { facingMode: 'environment' }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setScanning(true);
          
          // In a real app, this is where you would initialize barcode detection
          // For this demo, we'll simulate a barcode detection after 5 seconds
          setTimeout(() => {
            // Simulate detecting a barcode
            const mockBarcode = "5901234123457";
            onDetected(mockBarcode);
            setScanning(false);
          }, 5000);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please make sure you've granted camera permissions.");
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <Card variant="glass" className="border-purple-100/30 dark:border-purple-800/20">
        <CardContent className="p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="text-white text-sm">{error}</p>
                <Button 
                  variant="purple-gradient" 
                  size="sm" 
                  className="mt-4 rounded-full"
                  onClick={onReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/3 border-2 border-dashed border-purple-500 rounded-[32px] flex items-center justify-center">
                      <span className="text-purple-100 text-xs font-medium px-4 py-2 bg-purple-500/80 rounded-full flex items-center">
                        <Barcode className="h-3 w-3 mr-1" />
                        Scanning...
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-purple-100/50 dark:border-purple-800/20">
            <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center justify-center">
              Position the barcode within the frame to scan
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarcodeScanner;
