/**
 * Creates a SHA-256 hash of the provided string
 * @param {string} message - The message to hash
 * @returns {Promise<string>} - The resulting hash as a hex string
 */
async function sha256(message) {
  // Encode the message as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  
  // Hash the message using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert the hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Creates a partial hash for display/storage purposes
 * @param {string} id - The ID to hash
 * @param {string} secret - The secret to combine with the ID
 * @param {number} length - The length of the hash to return
 * @returns {Promise<string>} - The partial hash
 */
async function createSecureHash(id, secret, length = 16) {
  const hash = await sha256(`${id}${secret}`);
  return hash.substring(0, length);
}

export default {
  sha256,
  createSecureHash
}; 