
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { AlertCircle, RefreshCw, Barcode } from 'lucide-react';
import { motion } from 'framer-motion';
import Quagga from 'quagga';
import { useToast } from "@/hooks/use-toast";

const BarcodeScanner: React.FC<{
  onDetected: (code: string) => void;
  onReset: () => void;
}> = ({ onDetected, onReset }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  
  // Cleanup function for Quagga
  const stopScanner = () => {
    if (Quagga) {
      try {
        Quagga.stop();
        console.log("Quagga scanner stopped");
      } catch (err) {
        console.error("Error stopping Quagga:", err);
      }
    }
  };

  useEffect(() => {
    // Start barcode scanner
    const startScanner = async () => {
      if (!scannerRef.current) return;
      
      try {
        setError(null);
        setScanning(true);
        
        // Initialize Quagga
        await Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                facingMode: "environment", // Use back camera on mobile
                width: { min: 450 },
                height: { min: 300 },
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "upc_e_reader",
                "code_128_reader",
                "code_39_reader",
                "code_93_reader",
              ],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              console.error("Quagga initialization error:", err);
              setError("Could not initialize barcode scanner. Please try again or check camera permissions.");
              setScanning(false);
              return;
            }
            
            console.log("Quagga initialized successfully");
            Quagga.start();
          }
        );
        
        // Set up barcode detection handlers
        Quagga.onDetected((result) => {
          if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            console.log("Barcode detected:", code);
            
            // Stop scanner after detection
            stopScanner();
            setScanning(false);
            
            // Notify success
            toast({
              title: "Barcode Detected",
              description: `Found barcode: ${code}`,
            });
            
            // Pass code to parent component
            onDetected(code);
          }
        });
        
        // Debug logging
        Quagga.onProcessed((result) => {
          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;
          
          if (result) {
            // Highlight successful scans
            if (result.boxes) {
              drawingCtx.clearRect(
                0,
                0,
                parseInt(drawingCanvas.getAttribute("width") || "0"),
                parseInt(drawingCanvas.getAttribute("height") || "0")
              );
              result.boxes.filter((box) => box !== result.box).forEach((box) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                  color: "green",
                  lineWidth: 2,
                });
              });
            }
            
            // Draw a thicker line around successful decoded box
            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                color: "#00F",
                lineWidth: 2,
              });
            }
            
            // Highlight successful decoded barcode
            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
                color: 'red',
                lineWidth: 3,
              });
            }
          }
        });
        
      } catch (err) {
        console.error("Error accessing camera for barcode scanning:", err);
        setError("Could not access camera. Please make sure you've granted camera permissions.");
        setScanning(false);
      }
    };
    
    // Start scanner
    startScanner();
    
    // Clean up when component unmounts
    return () => {
      stopScanner();
    };
  }, [onDetected, toast]);

  const handleReset = () => {
    stopScanner();
    setError(null);
    onReset();
    // After a slight delay, restart the scanner
    setTimeout(() => {
      if (scannerRef.current) {
        setScanning(true);
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                facingMode: "environment",
                width: { min: 450 },
                height: { min: 300 },
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "upc_e_reader",
                "code_128_reader",
                "code_39_reader",
                "code_93_reader",
              ],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              console.error("Quagga re-initialization error:", err);
              setError("Could not restart barcode scanner. Please try again.");
              setScanning(false);
              return;
            }
            Quagga.start();
          }
        );
      }
    }, 500);
  };

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
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div 
                  ref={scannerRef} 
                  className="h-full w-full bg-black"
                >
                  {/* Quagga will inject the video stream here */}
                </div>
                
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
