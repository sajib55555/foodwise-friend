import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Barcode, Sparkles, Zap, Upload } from "lucide-react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import CameraComponent from "@/components/scan/Camera";
import BarcodeScanner from "@/components/scan/BarcodeScanner";
import ScanResult from "@/components/scan/ScanResult";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useActivityLog } from "@/contexts/ActivityLogContext";

const Scan = () => {
  const [scanMode, setScanMode] = useState<"camera" | "barcode">("camera");
  const [scanComplete, setScanComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset when changing scan mode
  useEffect(() => {
    if (!scanComplete) {
      setShowCamera(true);
      setCapturedImage(null);
      setDetectedBarcode(null);
    }
  }, [scanMode, scanComplete]);

  const handlePhotoCapture = (imageSrc: string) => {
    console.log("Photo captured:", imageSrc.substring(0, 50) + "...");
    setCapturedImage(imageSrc);
    setScanComplete(true);
    setShowCamera(false);
    
    logActivity('scan_food', 'Captured food image for analysis');
    
    toast({
      title: "Photo captured",
      description: "Analyzing your food...",
      variant: "default",
    });
  };

  const handleBarcodeDetected = (barcode: string) => {
    console.log("Barcode detected:", barcode);
    setDetectedBarcode(barcode);
    setScanComplete(true);
    setShowCamera(false);
    
    toast({
      title: "Barcode detected",
      description: `Found barcode: ${barcode}`,
      variant: "default",
    });
  };

  const handleReset = () => {
    setCapturedImage(null);
    setDetectedBarcode(null);
    setScanComplete(false);
    setShowCamera(true);
  };

  const handleCameraClose = () => {
    handleReset();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        handlePhotoCapture(imageUrl);
      };
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Unable to load image. Please try a different file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle tab change to reinitialize components
  const handleTabChange = (value: string) => {
    if (value === "camera" || value === "barcode") {
      setScanMode(value as "camera" | "barcode");
      // Force component remount by toggling showCamera
      setShowCamera(false);
      setTimeout(() => {
        setShowCamera(true);
      }, 100);
    }
  };

  // Update document title with current mode
  useEffect(() => {
    document.title = `NutriTrack - ${scanMode === "camera" ? "Camera" : "Barcode"} Scanner`;
  }, [scanMode]);

  return (
    <PageTransition>
      <Header title="NutriTrack Scanner" showBackButton />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-4 max-w-lg relative">
        {/* Background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/10 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-purple-400/20 rounded-full filter blur-3xl -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <Card variant="glass" className="border border-purple-200/30 dark:border-purple-800/20 shadow-lg rounded-3xl">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600">NutriTrack Scanner</h2>
                    <p className="text-sm text-muted-foreground">Snap or scan to get nutrition info</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {!scanComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card variant="glass" className="border-purple-100/30 dark:border-purple-800/20 rounded-3xl shadow-lg">
              <CardContent className="p-5">
                <Tabs 
                  defaultValue="camera" 
                  value={scanMode}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="w-full mb-5 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-100/50 dark:border-purple-900/20 rounded-full p-1">
                    <TabsTrigger 
                      value="camera" 
                      className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-purple-900/40 dark:data-[state=active]:to-blue-900/40 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200 rounded-full data-[state=active]:shadow-sm py-3"
                    >
                      <Camera className="h-5 w-5 mr-2 text-purple-600" />
                      Camera
                    </TabsTrigger>
                    <TabsTrigger 
                      value="barcode" 
                      className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-purple-900/40 dark:data-[state=active]:to-blue-900/40 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200 rounded-full data-[state=active]:shadow-sm py-3"
                    >
                      <Barcode className="h-5 w-5 mr-2 text-purple-600" />
                      Barcode
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="camera" className="mt-4">
                    {/* Camera view with rounded corners */}
                    {showCamera && (
                      <div className="rounded-3xl overflow-hidden shadow-lg">
                        <CameraComponent onCapture={handlePhotoCapture} onClose={handleCameraClose} />
                      </div>
                    )}
                    
                    <div className="mt-5 p-4 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl border border-purple-100/50 dark:border-purple-800/20">
                      <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                        Take a photo of your food to get nutritional information
                      </p>
                    </div>

                    {/* Upload from device button with rounded style */}
                    <div className="mt-5 flex justify-center">
                      <Button 
                        variant="outline"
                        className="w-full rounded-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 h-12"
                        onClick={triggerFileUpload}
                      >
                        <Upload className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                        Upload from Device
                      </Button>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="barcode" className="mt-4">
                    {showCamera && (
                      <BarcodeScanner 
                        onDetected={handleBarcodeDetected} 
                        onReset={handleReset} 
                      />
                    )}
                    
                    <div className="mt-5 p-4 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl border border-purple-100/50 dark:border-purple-800/20">
                      <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                        Scan a barcode to get detailed product information
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Switch mode button with full rounded style */}
                <div className="text-center mt-5">
                  <Button 
                    variant="purple-gradient"
                    size="pill-sm"  
                    hover="scale"
                    onClick={() => handleTabChange(scanMode === "camera" ? "barcode" : "camera")}
                    className="w-auto px-6 shadow-purple"
                  >
                    {scanMode === "camera" ? (
                      <>
                        <Barcode className="h-4 w-4 mr-2" />
                        Switch to Barcode
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Switch to Camera
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          capturedImage && (
            <ScanResult 
              imageSrc={capturedImage}
              onClose={handleReset} 
            />
          )
        )}
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Scan;
