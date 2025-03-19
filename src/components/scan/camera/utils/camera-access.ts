
/**
 * Utility functions for accessing and requesting camera hardware
 */
import {
  getDeviceCapabilities,
  getBestCameraConstraints,
  getCameraErrorMessage,
  isMobileDevice,
  hasMultipleCameras as checkForMultipleCameras
} from './device-detection';

/**
 * Camera facing mode types
 */
export type CameraFacingMode = 'user' | 'environment' | 'default';

/**
 * Re-export useful functions from device-detection
 */
export { isMobileDevice, getCameraErrorMessage };

/**
 * Checks if the device has multiple cameras
 */
export const hasMultipleCameras = async (): Promise<boolean> => {
  return checkForMultipleCameras();
};

/**
 * Requests camera access with the specified constraints
 * Uses device detection to optimize for different browsers and platforms
 */
export const requestCameraAccess = async (preferredFacingMode: CameraFacingMode = 'default'): Promise<MediaStream> => {
  console.log(`Attempting to access camera with preferred mode: ${preferredFacingMode}...`);
  
  // Check if the browser supports getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Your browser does not support camera access. Please try a different browser.");
  }
  
  // Get device capabilities to optimize constraints
  const capabilities = await getDeviceCapabilities();
  console.log("Device detected as:", capabilities.isMobile ? "mobile" : "desktop");
  console.log("Browser detected:", capabilities.browser);
  
  // First, try the most permissive constraints to see if camera access works at all
  try {
    console.log("Trying minimal camera constraints first to test access");
    const testStream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: false
    });
    
    // If we got a stream, stop it immediately and proceed with proper constraints
    const tracks = testStream.getTracks();
    tracks.forEach(track => track.stop());
    console.log("Camera access test successful, proceeding with proper setup");
  } catch (testErr) {
    console.error("Camera access test failed:", testErr);
    throw new Error(getCameraErrorMessage(testErr as Error, capabilities));
  }
  
  // Get optimized constraints based on device capabilities
  const constraints = await getBestCameraConstraints(preferredFacingMode as 'user' | 'environment' | 'default');
  
  try {
    console.log("Using optimized constraints:", JSON.stringify(constraints));
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log(`Successfully accessed camera with optimized constraints`);
    return stream;
  } catch (err) {
    console.warn("Optimized constraints failed:", err);
    
    // Try with simplified constraints
    try {
      console.log("Falling back to simplified constraints");
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
        video: preferredFacingMode !== 'default' ? { facingMode: preferredFacingMode } : true,
        audio: false
      });
      console.log("Successfully accessed camera with fallback constraints");
      return fallbackStream;
    } catch (fallbackErr) {
      console.error("All camera access attempts failed:", fallbackErr);
      throw new Error(getCameraErrorMessage(fallbackErr as Error, capabilities));
    }
  }
};
