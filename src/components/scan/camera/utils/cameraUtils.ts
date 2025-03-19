
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
  
  // Try environment camera (back camera) first with lower quality for better compatibility
  try {
    console.log("Requesting camera access with environment facing mode...");
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    console.log("Successfully accessed environment camera");
    return stream;
  } catch (err) {
    console.warn("Environment camera failed:", err);
    
    // Fall back to any available camera with minimal constraints
    try {
      console.log("Trying any available camera with minimal constraints");
      const stream = await navigator.mediaDevices.getUserMedia({ 
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
    
    // Reset srcObject in case it was previously set
    if (videoElement.srcObject) {
      videoElement.srcObject = null;
    }
    
    // Set srcObject
    videoElement.srcObject = stream;
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // Force play to start immediately
    const playVideo = () => {
      videoElement.play()
        .then(() => {
          console.log("Camera started successfully");
          onSuccess();
        })
        .catch(err => {
          console.error("Error playing video:", err);
          
          // Try one more time after a short delay
          setTimeout(() => {
            videoElement.play()
              .then(() => {
                console.log("Camera started successfully on retry");
                onSuccess();
              })
              .catch(retryErr => {
                console.error("Error playing video on retry:", retryErr);
                onError("Failed to start video stream. Please try again or use the upload option.");
              });
          }, 300);
        });
    };
    
    // Add all possible event listeners to debug
    videoElement.onloadedmetadata = () => {
      console.log("Video metadata loaded");
      playVideo();
    };
    
    videoElement.onplaying = () => {
      console.log("Video is now playing, dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
    };
    
    // Fallback in case onloadedmetadata doesn't fire
    setTimeout(() => {
      if (videoElement.paused && videoElement.srcObject) {
        console.log("Fallback: forcing video play after delay");
        playVideo();
      }
    }, 1000);
    
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
