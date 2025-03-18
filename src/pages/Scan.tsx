
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card } from "@/components/ui/card-custom";
import CameraComponent from "@/components/scan/Camera";
import ScanResult from "@/components/scan/ScanResult";
import { AnimatePresence } from "framer-motion";

const Scan = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setCameraActive(false);
  };

  const handleReset = () => {
    setCapturedImage(null);
  };

  const activateCamera = () => {
    setCameraActive(true);
  };

  const closeCamera = () => {
    setCameraActive(false);
  };

  return (
    <>
      <Header title="Food Scanner" showBackButton={cameraActive || !!capturedImage} />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <AnimatePresence mode="wait">
            {cameraActive ? (
              <div className="h-[calc(100vh-8rem)]">
                <CameraComponent onCapture={handleCapture} onClose={closeCamera} />
              </div>
            ) : capturedImage ? (
              <ScanResult imageUrl={capturedImage} onReset={handleReset} />
            ) : (
              <div className="space-y-6">
                <Card 
                  variant="glass"
                  className="p-6 flex flex-col items-center text-center"
                >
                  <div className="mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop" 
                      alt="Food" 
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Analyze Your Food</h2>
                  <p className="text-muted-foreground mb-6">
                    Take a photo of your meal or scan a food label to get nutritional information
                  </p>
                  <button
                    onClick={activateCamera}
                    className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:brightness-105 transition-all active:scale-[0.98]"
                  >
                    Start Scanning
                  </button>
                </Card>

                <div>
                  <h3 className="text-lg font-medium mb-3">Recent Scans</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((item) => (
                      <div 
                        key={item} 
                        className="aspect-square rounded-xl overflow-hidden bg-muted/50"
                      >
                        <div className="w-full h-full bg-slate-200 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </PageTransition>
      {!cameraActive && <MobileNavbar />}
    </>
  );
};

export default Scan;
