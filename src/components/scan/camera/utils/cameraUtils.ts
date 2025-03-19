
/**
 * Camera utility functions for accessing and managing camera streams
 */

/**
 * Requests camera access with the specified constraints
 * Tries environment camera first, then falls back to any available camera
 */
export const requestCameraAccess = async (): Promise<MediaStream> => {
  console.log("Attempting to access camera...");
  
  // Try environment camera (back camera) first
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
    
    // Fall back to any available camera
    try {
      console.log("Trying any available camera");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      console.log("Successfully accessed default camera");
      return stream;
    } catch (secondErr) {
      console.error("All camera access attempts failed:", secondErr);
      throw new Error("Could not access any camera");
    }
  }
};

/**
 * Stops all tracks in a media stream
 */
export const stopStreamTracks = (stream: MediaStream | null): void => {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
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
  videoElement.srcObject = stream;
  videoElement.muted = true;
  videoElement.playsInline = true;
  
  // Wait for metadata to load before playing
  videoElement.onloadedmetadata = () => {
    videoElement.play()
      .then(() => {
        console.log("Camera started successfully");
        onSuccess();
      })
      .catch(err => {
        console.error("Error playing video:", err);
        onError("Failed to start video stream. Please try again or use the upload option.");
      });
  };
};
