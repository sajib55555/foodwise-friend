
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Barcode, ImageIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button-custom";
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

  // Add a handler for the onClose prop
  const handleCameraClose = () => {
    // This function will be called when the camera component is closed
    // We can simply reset the state if needed, or do nothing
    handleReset();
  };

  return (
    <PageTransition>
      <Header title="Food Scanner" showBackButton />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        {!scanComplete ? (
          <>
            <Tabs defaultValue="camera" className="w-full mb-6" onValueChange={(value) => setScanMode(value as "camera" | "barcode")}>
              <TabsList className="w-full">
                <TabsTrigger value="camera" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="barcode" className="flex-1">
                  <Barcode className="h-4 w-4 mr-2" />
                  Barcode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="mt-6">
                <CameraComponent onCapture={handlePhotoCapture} onClose={handleCameraClose} />
              </TabsContent>
              
              <TabsContent value="barcode" className="mt-6">
                <BarcodeScanner onDetected={handleBarcodeDetected} onReset={handleReset} />
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {scanMode === "camera" 
                  ? "Take a photo of your food to get nutritional information"
                  : "Scan a barcode to get product information"
                }
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setScanMode(scanMode === "camera" ? "barcode" : "camera")}
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
          </>
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
