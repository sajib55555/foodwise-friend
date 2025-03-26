import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import { AlertCircle, RefreshCw, Barcode } from 'lucide-react';
import { motion } from 'framer-motion';
import Quagga from 'quagga';
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from '@/contexts/ActivityLogContext';

const BarcodeScanner: React.FC<{
  onDetected: (code: string) => void;
  onReset: () => void;
}> = ({ onDetected, onReset }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResults, setLastResults] = useState<string[]>([]);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  
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

  const filterResults = (code: string) => {
    const newResults = [...lastResults, code].slice(-5);
    setLastResults(newResults);
    
    const resultCounts: Record<string, number> = {};
    newResults.forEach(result => {
      resultCounts[result] = (resultCounts[result] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantCode = '';
    
    for (const [code, count] of Object.entries(resultCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantCode = code;
      }
    }
    
    return maxCount >= 3 ? dominantCode : null;
  };

  const initQuagga = (target: HTMLElement) => {
    return new Promise<void>((resolve, reject) => {
      if (!target) {
        reject(new Error("Target element not available"));
        return;
      }
      
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: target,
            constraints: {
              facingMode: "environment",
              width: { min: 640 },
              height: { min: 480 },
              aspectRatio: { min: 1, max: 2 }
            },
            area: {
              top: "20%",
              right: "20%",
              left: "20%",
              bottom: "20%"
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency ? Math.max(navigator.hardwareConcurrency - 1, 1) : 2,
          frequency: 10,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader"
            ],
            multiple: false
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error("Quagga initialization error:", err);
            reject(err);
            return;
          }
          
          console.log("Quagga initialized successfully");
          resolve();
        }
      );
    });
  };

  useEffect(() => {
    const startScanner = async () => {
      try {
        setError(null);
        setScanning(true);
        setLastResults([]);
        
        if (!scannerRef.current) {
          setError("Scanner element not found");
          setScanning(false);
          return;
        }
        
        await initQuagga(scannerRef.current);
        Quagga.start();
        
        Quagga.onDetected((result) => {
          if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            console.log("Barcode candidate detected:", code);
            
            const validCode = filterResults(code);
            
            if (validCode) {
              console.log("Valid barcode confirmed:", validCode);
              
              stopScanner();
              setScanning(false);
              
              logActivity('scan_food', `Scanned barcode: ${validCode}`, { barcode: validCode });
              
              toast({
                title: "Barcode Detected",
                description: `Found barcode: ${validCode}`,
              });
              
              onDetected(validCode);
            }
          }
        });
      } catch (err: any) {
        console.error("Error accessing camera for barcode scanning:", err);
        setError("Could not access camera. Please ensure you've granted camera permissions and no other app is using your camera.");
        setScanning(false);
      }
    };
    
    startScanner();
    
    return () => {
      stopScanner();
    };
  }, [onDetected, toast, logActivity]);

  const handleReset = () => {
    stopScanner();
    setError(null);
    setLastResults([]);
    onReset();
    setTimeout(() => {
      if (scannerRef.current) {
        setScanning(true);
        initQuagga(scannerRef.current)
          .then(() => {
            Quagga.start();
          })
          .catch((err) => {
            console.error("Quagga re-initialization error:", err);
            setError("Could not restart barcode scanner. Please try again.");
            setScanning(false);
          });
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
              Position the barcode within the frame and hold steady for scanning
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarcodeScanner;

