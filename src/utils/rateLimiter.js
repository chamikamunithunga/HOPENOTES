// Rate limiting utility to prevent DDoS attacks
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    // maxRequests: maximum number of requests allowed
    // windowMs: time window in milliseconds (default 60 seconds)
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // Store request timestamps by key
  }

  // Clean up old entries to prevent memory leaks
  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  // Check if a request is allowed
  isAllowed(key) {
    this.cleanup();
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the time window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  // Get remaining requests in current window
  getRemaining(key) {
    this.cleanup();
    const timestamps = this.requests.get(key) || [];
    const now = Date.now();
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  // Get time until next request is allowed
  getTimeUntilReset(key) {
    this.cleanup();
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return 0;

    const now = Date.now();
    const oldestTimestamp = Math.min(...timestamps);
    const timeSinceOldest = now - oldestTimestamp;
    return Math.max(0, this.windowMs - timeSinceOldest);
  }
}

// Create rate limiters for different operations
export const uploadRateLimiter = new RateLimiter(3, 60000); // 3 uploads per minute
export const feedbackRateLimiter = new RateLimiter(2, 60000); // 2 feedbacks per minute
export const fetchRateLimiter = new RateLimiter(10, 60000); // 10 fetches per minute

// Get client identifier (IP-based or session-based)
export function getClientId() {
  // Use sessionStorage to track client sessions
  let clientId = sessionStorage.getItem('clientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('clientId', clientId);
  }
  return clientId;
}

