
/**
 * Utility functions for managing media streams and tracks
 */

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
