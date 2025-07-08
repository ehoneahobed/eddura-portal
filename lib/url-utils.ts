/**
 * URL utility functions for safely handling and formatting URLs
 */

/**
 * Safely extracts hostname from a URL string
 * Adds protocol if missing and handles invalid URLs gracefully
 */
export function getHostnameFromUrl(url: string): string {
  try {
    // If URL doesn't start with protocol, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return new URL(url).hostname;
  } catch (error) {
    // If URL parsing fails, return the original string or a cleaned version
    return url.replace(/^(https?:\/\/)/, '');
  }
}

/**
 * Formats a URL string to be safe for use in href attributes
 * Adds protocol if missing
 */
export function formatUrlForHref(url: string): string {
  if (!url) return '';
  // If URL doesn't start with protocol, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    // Try with the URL as-is first
    new URL(url);
    return true;
  } catch {
    try {
      // Try with https:// prefix
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Normalizes a URL by ensuring it has a protocol
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // If it already has a protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// by default
  return `https://${url}`;
}