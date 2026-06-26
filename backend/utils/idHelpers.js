/**
 * Check if an ID is a fallback ID (not a valid MongoDB ObjectId)
 * Fallback IDs follow patterns like:
 * - Restaurant: 'r1', 'r2', 'r5'
 * - Address: 'address-1', 'address-123'
 * - Order: 'order-123'
 * - Menu item: 'm1', 'm2'
 * - User: 'user-1', 'merchant-demo'
 * 
 * @param {string} id - The ID to check
 * @returns {boolean} True if it's a fallback ID
 */
const isFallbackId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Check for restaurant/menu item patterns (r1, m1, etc.)
  if (/^[rm]\d+$/.test(id)) {
    return true;
  }
  
  // Check for address patterns (address-1, address-123)
  if (/^address-\d+$/.test(id)) {
    return true;
  }
  
  // Check for order patterns (order-123)
  if (/^order-\d+$/.test(id)) {
    return true;
  }
  
  // Check for user patterns (user-1, merchant-demo)
  if (/^(user|merchant|driver|customer)-/.test(id)) {
    return true;
  }
  
  // Check if it's a valid MongoDB ObjectId (24 hex chars)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return !objectIdRegex.test(id);
};

/**
 * Validate an ID for MongoDB operations
 * @param {string} id - The ID to validate
 * @returns {Object} Result with isValid and isFallback properties
 */
const validateId = (id) => {
  const fallback = isFallbackId(id);
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const isValidObjectId = objectIdRegex.test(id);
  
  return {
    isValid: isValidObjectId || fallback,
    isFallback: fallback,
    isValidObjectId: isValidObjectId
  };
};

module.exports = {
  isFallbackId,
  validateId
};