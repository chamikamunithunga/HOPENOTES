// Input sanitization utility to prevent XSS and injection attacks

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return String(input || '');
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent DoS
  const maxLength = 5000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(trimmed);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    // Limit URL length
    if (trimmed.length > 2048) {
      return '';
    }
    
    return trimmed;
  } catch (e) {
    return '';
  }
}

/**
 * Validate and sanitize name input
 */
export function sanitizeName(name) {
  if (typeof name !== 'string') {
    return '';
  }

  let sanitized = name.trim();
  
  // Remove special characters but keep basic punctuation
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
  
  // Limit length
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate and sanitize feedback text
 */
export function sanitizeFeedback(feedback) {
  if (typeof feedback !== 'string') {
    return '';
  }

  let sanitized = sanitizeString(feedback);
  
  // Limit length for feedback
  const maxLength = 2000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

