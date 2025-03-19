/**
 * Utility functions for device and browser detection
 * to improve camera compatibility across different platforms
 */

/**
 * Device platforms
 */
export type DevicePlatform = 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'other';

/**
 * Browser types
 */
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'samsung' | 'unknown';

/**
 * Device and browser capability interface
 */
export interface DeviceCapabilities {
  platform: DevicePlatform;
  browser: BrowserType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasCamera: boolean;
  supportsStreamingAPI: boolean;
  preferredFacingMode: 'user' | 'environment' | 'default';
  supportsExactConstraints: boolean;
  supportsAdvancedConstraints: boolean;
  supportsAutoplayWithoutUserInteraction: boolean;
}

/**
 * Detects the current device platform
 */
export const detectPlatform = (): DevicePlatform => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios';
  }
  
  if (/android/i.test(userAgent)) {
    return 'android';
  }
  
  if (/Win/.test(navigator.platform)) {
    return 'windows';
  }
  
  if (/Mac/.test(navigator.platform)) {
    return 'mac';
  }
  
  if (/Linux/.test(navigator.platform)) {
    return 'linux';
  }
  
  return 'other';
};

/**
 * Detects the current browser type
 */
export const detectBrowser = (): BrowserType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('edge') > -1 || userAgent.indexOf('edg/') > -1) {
    return 'edge';
  }
  
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('safari') > -1) {
    if (userAgent.indexOf('samsung') > -1) {
      return 'samsung';
    }
    return 'chrome';
  }
  
  if (userAgent.indexOf('firefox') > -1) {
    return 'firefox';
  }
  
  if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  }
  
  if (userAgent.indexOf('opr') > -1 || userAgent.indexOf('opera') > -1) {
    return 'opera';
  }
  
  return 'unknown';
};

/**
 * Checks if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Checks if the device is likely a tablet
 */
export const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    /ipad/.test(userAgent) || 
    (/android/.test(userAgent) && !/mobile/.test(userAgent)) ||
    (window.innerWidth >= 600 && window.innerWidth <= 1024 && isMobileDevice())
  );
};

/**
 * Checks if the device has multiple cameras
 */
export const hasMultipleCameras = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return false;
  }
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(device => device.kind === 'videoinput');
    return videoInputs.length > 1;
  } catch (error) {
    console.error('Error checking for multiple cameras:', error);
    return false;
  }
};

/**
 * Checks if the current browser supports advanced camera constraints
 */
export const supportsAdvancedConstraints = (): boolean => {
  const browser = detectBrowser();
  const platform = detectPlatform();
  
  // Chrome, Edge and newer Firefox support advanced constraints
  if (browser === 'chrome' || browser === 'edge') {
    return true;
  }
  
  // Safari on iOS 13+ has better camera support
  if (browser === 'safari' && platform === 'ios') {
    // Try to detect iOS version
    const match = navigator.userAgent.match(/OS (\d+)_/);
    if (match && match[1]) {
      return parseInt(match[1], 10) >= 13;
    }
  }
  
  // Firefox supports some advanced features
  if (browser === 'firefox') {
    return true;
  }
  
  return false;
};

/**
 * Checks if the device supports the Stream API
 */
export const supportsStreamAPI = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Determines if the browser supports autoplay without user interaction
 */
export const supportsAutoplayWithoutInteraction = (): boolean => {
  const browser = detectBrowser();
  const platform = detectPlatform();
  
  // Most desktop browsers support autoplay for muted videos
  if (!isMobileDevice()) {
    return true;
  }
  
  // iOS Safari requires user interaction
  if (platform === 'ios') {
    return false;
  }
  
  // Chrome on Android supports autoplay for muted videos
  if (browser === 'chrome' && platform === 'android') {
    return true;
  }
  
  return false;
};

/**
 * Gets the full device capabilities
 */
export const getDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
  const platform = detectPlatform();
  const browser = detectBrowser();
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  
  // Determine if the device has a camera
  let hasCamera = false;
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera = devices.some(device => device.kind === 'videoinput');
    } catch (err) {
      console.warn('Could not enumerate devices:', err);
      // Assume camera exists if we couldn't check
      hasCamera = true;
    }
  } else {
    // If we can't check, assume the device has a camera
    hasCamera = true;
  }
  
  // Determine preferred camera mode
  let preferredFacingMode: 'user' | 'environment' | 'default' = 'default';
  if (isMobile) {
    // On mobile, prefer back camera
    preferredFacingMode = 'environment';
  } else {
    // On desktop, prefer front camera
    preferredFacingMode = 'user';
  }
  
  // Determine if the browser supports exact constraints
  const supportsExactConstraints = supportsAdvancedConstraints();
  
  return {
    platform,
    browser,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    hasCamera,
    supportsStreamingAPI: supportsStreamAPI(),
    preferredFacingMode,
    supportsExactConstraints,
    supportsAdvancedConstraints: supportsAdvancedConstraints(),
    supportsAutoplayWithoutUserInteraction: supportsAutoplayWithoutInteraction()
  };
};

/**
 * Gets the best camera constraints based on device capabilities
 */
export const getBestCameraConstraints = async (facingMode: 'user' | 'environment' | 'default' = 'default'): Promise<MediaStreamConstraints> => {
  const capabilities = await getDeviceCapabilities();
  
  // If no specific facing mode is requested, use the device's preferred mode
  if (facingMode === 'default') {
    facingMode = capabilities.preferredFacingMode;
  }
  
  // Base video constraints
  let videoConstraints: any = { 
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };
  
  // Add facing mode based on platform capabilities
  if (capabilities.isMobile) {
    if (capabilities.supportsExactConstraints) {
      videoConstraints.facingMode = { exact: facingMode };
    } else {
      videoConstraints.facingMode = facingMode;
    }
  } else {
    // For desktop, just set facingMode without exact constraint
    videoConstraints.facingMode = facingMode;
  }
  
  // Special handling for iOS Safari
  if (capabilities.platform === 'ios' && capabilities.browser === 'safari') {
    // iOS Safari sometimes performs better with simpler constraints
    if (facingMode === 'environment') {
      videoConstraints = { facingMode: { exact: 'environment' } };
    } else {
      videoConstraints = { facingMode: 'user' };
    }
  }
  
  // Special handling for Samsung browser
  if (capabilities.browser === 'samsung') {
    // Samsung browser may need a different approach
    delete videoConstraints.width;
    delete videoConstraints.height;
    videoConstraints.facingMode = facingMode;
  }
  
  return {
    video: videoConstraints,
    audio: false
  };
};

/**
 * Adds browser-specific styling for video elements
 */
export const applyVideoElementFixes = (videoElement: HTMLVideoElement | null): void => {
  if (!videoElement) return;
  
  const capabilities = {
    platform: detectPlatform(),
    browser: detectBrowser()
  };
  
  // Ensure video is visible
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';
  videoElement.style.objectFit = 'cover';
  videoElement.style.display = 'block';
  videoElement.style.visibility = 'visible';
  videoElement.style.opacity = '1';
  
  // iOS Safari fixes
  if (capabilities.platform === 'ios' && capabilities.browser === 'safari') {
    videoElement.style.transform = 'translateZ(0)'; // Hardware acceleration
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
  }
  
  // Samsung browser fixes
  if (capabilities.browser === 'samsung') {
    videoElement.style.transform = 'translateZ(0)';
  }
};

/**
 * Get error message tailored to the specific browser/platform
 */
export const getCameraErrorMessage = (error: Error, capabilities?: DeviceCapabilities): string => {
  if (!capabilities) {
    capabilities = {
      platform: detectPlatform(),
      browser: detectBrowser(),
      isMobile: isMobileDevice(),
      isTablet: isTabletDevice(),
      isDesktop: !isMobileDevice() && !isTabletDevice(),
      hasCamera: true,
      supportsStreamingAPI: supportsStreamAPI(),
      preferredFacingMode: 'default',
      supportsExactConstraints: supportsAdvancedConstraints(),
      supportsAdvancedConstraints: supportsAdvancedConstraints(),
      supportsAutoplayWithoutUserInteraction: supportsAutoplayWithoutInteraction()
    };
  }
  
  // NotFoundError: Camera not found or not accessible
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    if (capabilities.platform === 'ios') {
      return "Camera access failed. On iOS, make sure you're using Safari and have allowed camera permissions.";
    }
    return "No camera found. Please ensure your device has a camera and it's not being used by another application.";
  }
  
  // NotAllowedError: Permission denied
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    if (capabilities.browser === 'chrome') {
      return "Camera permission denied. Please click the camera icon in your address bar and select 'Allow'.";
    } else if (capabilities.browser === 'safari') {
      return "Camera permission denied. Please enable camera access in Safari settings.";
    } else if (capabilities.browser === 'firefox') {
      return "Camera permission denied. Please click the camera icon in your address bar and choose 'Remember this decision'.";
    }
    return "Camera permission denied. Please enable camera access in your browser settings and reload the page.";
  }
  
  // NotReadableError: Hardware or OS error
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    if (capabilities.platform === 'android') {
      return "Could not start the camera. Please ensure no other app is using your camera and try again.";
    }
    return "Could not access camera. The camera may be in use by another application.";
  }
  
  // OverconstrainedError: Constraints cannot be satisfied
  if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
    return "The camera doesn't support the requested settings. Please try a different camera if available.";
  }
  
  // AbortError: General error
  if (error.name === 'AbortError') {
    return "The camera operation was aborted. Please try again.";
  }
  
  // SecurityError: HTTPS required
  if (error.name === 'SecurityError') {
    return "Camera access is only available in secure contexts (HTTPS). Please use a secure connection.";
  }
  
  // TypeErrors are usually programming errors
  if (error.name === 'TypeError') {
    return "Invalid camera settings. Please try a different camera or device.";
  }
  
  // Default error message
  return `Camera error: ${error.message || 'Unknown error'}. Please try again or use a different device.`;
};
