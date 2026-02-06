/**
 * Utility functions for mobile device detection and MetaMask deep linking
 */

/**
 * Detects if the current device is a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detects if the user is using MetaMask mobile browser
 */
export function isMetaMaskMobile(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  return /MetaMaskMobile/i.test(userAgent);
}

/**
 * Opens MetaMask app via deep link on mobile devices
 * Falls back to download page if not on mobile
 */
export function openMetaMaskApp(): void {
  if (isMobile()) {
    // Try to open MetaMask app via deep link
    window.location.href = "metamask://";
    
    // Fallback: if app doesn't open, redirect to download page after a delay
    setTimeout(() => {
      window.open("https://metamask.io/download/", "_blank");
    }, 2000);
  } else {
    // Desktop: open download page
    window.open("https://metamask.io/download/", "_blank");
  }
}

/**
 * Attempts to redirect to MetaMask app for signing on mobile
 * This should be called before attempting to sign a message
 */
export function redirectToMetaMaskForSigning(): void {
  if (isMobile() && !window.ethereum?.isMetaMask) {
    // On mobile without MetaMask extension, redirect to app
    openMetaMaskApp();
    throw new Error("Please open this page in MetaMask mobile browser or install MetaMask extension");
  }
}
