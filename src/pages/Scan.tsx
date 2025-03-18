
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Barcode, ImageIcon, Sparkles, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button-custom";
import { Card, CardContent } from "@/components/ui/card-custom";
import CameraComponent from "@/components/scan/Camera";
import BarcodeScanner from "@/components/scan/BarcodeScanner";
import ScanResult from "@/components/scan/ScanResult";

const Scan = () => {
  const [scanMode, setScanMode] = useState<"camera" | "barcode">("camera");
  const [scanComplete, setScanComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);

  const handlePhotoCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setScanComplete(true);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setDetectedBarcode(barcode);
    setScanComplete(true);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setDetectedBarcode(null);
    setScanComplete(false);
  };

  const handleCameraClose = () => {
    handleReset();
  };

  return (
    <PageTransition>
      <Header title="Food Scanner" showBackButton />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/5 rounded-full filter blur-3xl -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card variant="glass" className="border border-blue-200/30 dark:border-blue-800/20">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Instant Food Scanner</h2>
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
            <Card variant="glass">
              <CardContent className="p-6">
                <Tabs defaultValue="camera" className="w-full" onValueChange={(value) => setScanMode(value as "camera" | "barcode")}>
                  <TabsList className="w-full mb-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20">
                    <TabsTrigger value="camera" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-200">
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </TabsTrigger>
                    <TabsTrigger value="barcode" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-200">
                      <Barcode className="h-4 w-4 mr-2" />
                      Barcode
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="camera" className="mt-6">
                    <CameraComponent onCapture={handlePhotoCapture} onClose={handleCameraClose} />
                    
                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                        Take a photo of your food to get nutritional information
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="barcode" className="mt-6">
                    <BarcodeScanner onDetected={handleBarcodeDetected} onReset={handleReset} />
                    
                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                        Scan a barcode to get detailed product information
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="text-center mt-6">
                  <Button 
                    variant={scanMode === "camera" ? "blue-gradient" : "purple-gradient"}
                    size="lg"
                    hover="scale"
                    onClick={() => setScanMode(scanMode === "camera" ? "barcode" : "camera")}
                    className="w-full sm:w-auto"
                  >
                    {scanMode === "camera" ? (
                      <>
                        <Barcode className="h-4 w-4 mr-2" />
                        Switch to Barcode Scanner
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
          <ScanResult 
            imageUrl={capturedImage || ""}
            barcode={detectedBarcode}
            onReset={handleReset} 
          />
        )}
      </main>
      <MobileNavbar />
    </PageTransition>
  );
};

export default Scan;
