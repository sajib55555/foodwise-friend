
/**
 * Utility functions for accessing and requesting camera hardware
 */

/**
 * Requests camera access with the specified constraints
 * Tries environment camera first, then falls back to any available camera
 */
export const requestCameraAccess = async (): Promise<MediaStream> => {
  console.log("Attempting to access camera...");
  
  // Check if the browser supports getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Your browser does not support camera access. Please try a different browser.");
  }
  
  // Try to detect mobile devices to prioritize back camera
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log("Device detected as:", isMobile ? "mobile" : "desktop");
  
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
    throw new Error("Camera access denied. Please check your browser permissions.");
  }
  
  let stream: MediaStream | null = null;
  
  // On mobile prioritize the environment camera (back camera)
  if (isMobile) {
    try {
      console.log("Mobile device detected - trying back camera first");
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      console.log("Successfully accessed back camera");
      return stream;
    } catch (err) {
      console.warn("Back camera with exact constraint failed:", err);
      
      // Try without 'exact' constraint
      try {
        console.log("Trying back camera without exact constraint");
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log("Successfully accessed back camera");
        return stream;
      } catch (fallbackErr) {
        console.warn("Back camera fallback failed:", fallbackErr);
      }
    }
  }
  
  // Try user camera (front camera) specifically
  if (!stream) {
    try {
      console.log("Trying user (front) camera");
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      console.log("Successfully accessed front camera");
      return stream;
    } catch (frontErr) {
      console.warn("Front camera failed:", frontErr);
    }
  }
  
  // Fall back to any available camera with minimal constraints
  if (!stream) {
    try {
      console.log("Trying any available camera with minimal constraints");
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      console.log("Successfully accessed default camera");
      return stream;
    } catch (secondErr) {
      console.error("All camera access attempts failed:", secondErr);
      throw new Error("Could not access any camera. Please check permissions and try again.");
    }
  }
  
  // This should never happen, but TypeScript wants a return statement
  throw new Error("Failed to initialize camera");
};
