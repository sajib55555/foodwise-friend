
/**
 * Utility functions for setting up video elements with media streams
 */

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
