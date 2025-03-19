
/**
 * Camera utility functions for accessing and managing camera streams
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

/**
 * Stops all tracks in a media stream
 */
export const stopStreamTracks = (stream: MediaStream | null): void => {
  if (stream) {
    console.log("Stopping all camera tracks");
    const tracks = stream.getTracks();
    tracks.forEach(track => {
      try {
        track.stop();
        console.log("Track stopped:", track.kind);
      } catch (e) {
        console.error("Error stopping track:", e);
      }
    });
  }
};

/**
 * Sets up video element with the provided stream
 */
export const setupVideoStream = (
  videoElement: HTMLVideoElement,
  stream: MediaStream,
  onSuccess: () => void,
  onError: (error: string) => void
): void => {
  try {
    if (!videoElement) {
      throw new Error("Video element is not available");
    }
    
    console.log("Setting up video stream...");
    
    // Ensure readyState is reset
    videoElement.pause();
    
    // Reset srcObject in case it was previously set
    if (videoElement.srcObject) {
      videoElement.srcObject = null;
    }
    
    // Set critical styles first to ensure visibility
    videoElement.style.display = 'block !important';
    videoElement.style.visibility = 'visible !important';
    videoElement.style.opacity = '1 !important';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.backgroundColor = '#000';
    videoElement.style.zIndex = '10';
    
    // Set stream and properties
    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // Force play to start immediately
    const playVideo = () => {
      // Ensure video is visible - important!
      videoElement.style.display = 'block !important';
      videoElement.style.visibility = 'visible !important';
      videoElement.style.opacity = '1 !important';
      
      // Force layout recalculation
      void videoElement.offsetHeight;
      
      console.log("Attempting to play video");
      
      videoElement.play()
        .then(() => {
          console.log("Camera started successfully");
          // Ensure video is still visible after successful play
          videoElement.style.display = 'block !important';
          videoElement.style.visibility = 'visible !important';
          videoElement.style.opacity = '1 !important';
          
          // Force browser to recalculate layout
          void videoElement.offsetHeight;
          
          // Add a small delay before calling success to ensure everything is ready
          setTimeout(() => {
            onSuccess();
          }, 100);
        })
        .catch(err => {
          console.error("Error playing video:", err);
          
          // Try one more time after a short delay with more assertive styles
          setTimeout(() => {
            // Even more direct styling
            videoElement.style.display = 'block !important';
            videoElement.style.visibility = 'visible !important';
            videoElement.style.opacity = '1 !important';
            
            // Force layout recalculation
            void videoElement.offsetHeight;
            
            videoElement.play()
              .then(() => {
                console.log("Camera started successfully on retry");
                // Ensure video is visible
                videoElement.style.display = 'block !important';
                videoElement.style.visibility = 'visible !important';
                videoElement.style.opacity = '1 !important';
                
                onSuccess();
              })
              .catch(retryErr => {
                console.error("Error playing video on retry:", retryErr);
                onError("Failed to start video stream. Please try again or use the upload option.");
              });
          }, 300);
        });
    };
    
    // Set up all possible event listeners to debug
    videoElement.onloadedmetadata = () => {
      console.log("Video metadata loaded");
      playVideo();
    };
    
    videoElement.onplaying = () => {
      console.log("Video is now playing, dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
      // Make absolutely sure video is visible
      videoElement.style.display = 'block !important';
      videoElement.style.visibility = 'visible !important';
      videoElement.style.opacity = '1 !important';
      
      // Force layout recalculation
      void videoElement.offsetHeight;
    };
    
    // Fallback in case onloadedmetadata doesn't fire
    setTimeout(() => {
      if ((videoElement.paused || videoElement.readyState < 2) && videoElement.srcObject) {
        console.log("Fallback: forcing video play after delay");
        playVideo();
      }
    }, 500);
    
    // Add error handler
    videoElement.onerror = (event) => {
      console.error("Video element error:", event);
      onError("Video error occurred. Please refresh and try again.");
    };
  } catch (error) {
    console.error("Error setting up video stream:", error);
    onError(`Failed to set up video stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
