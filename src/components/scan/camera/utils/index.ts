
/**
 * Utility functions for camera operations
 */

// Export everything except hasMultipleCameras from device-detection
export {
  detectPlatform,
  detectBrowser,
  isMobileDevice,
  isTabletDevice,
  getDeviceCapabilities,
  getBestCameraConstraints,
  supportsAdvancedConstraints,
  supportsStreamAPI,
  supportsAutoplayWithoutInteraction,
  getCameraErrorMessage,
  applyVideoElementFixes,
} from './device-detection';

// Export specific items from device-detection with explicit naming
// We'll use a different name to avoid the conflict
export { hasMultipleCameras as checkDeviceForMultipleCameras } from './device-detection';

// Export from other utility files
export * from './stream-management';
export * from './video-setup';

// Export from camera-access last, which will provide the main hasMultipleCameras function
export * from './camera-access';
