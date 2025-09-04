const jwt = require('jsonwebtoken');

// This is one of the actual tokens from our login test
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhMTU2NTM0LTgyMjYtNGIxZi1iODFlLWJiMDBlOTYzZjMxMCIsInVzZXJUeXBlIjoiVVNFUiIsImlhdCI6MTc1Njk5NjA3MywiZXhwIjoxNzU3MDgyNDczfQ.Agtki_N907F5yZnOGWPUtknDmR08gZCbGX3f7qdFjWM";
const secret = "test_local_key_for_development_only_32_chars_minimum_length_required";

console.log("🔍 JWT Token Analysis:");
console.log("📝 Token:", token);
console.log();

try {
  // Decode without verification first to see structure
  const decoded = jwt.decode(token, { complete: true });
  console.log("📋 Header:", JSON.stringify(decoded.header, null, 2));
  console.log("📋 Payload:", JSON.stringify(decoded.payload, null, 2));
  console.log();
  
  // Verify with secret key
  const verified = jwt.verify(token, secret);
  console.log("✅ Token is VALID and properly signed!");
  console.log("👤 User ID:", verified.id);
  console.log("🔐 User Type:", verified.userType);
  console.log("🕐 Issued At:", new Date(verified.iat * 1000).toISOString());
  console.log("⏰ Expires At:", new Date(verified.exp * 1000).toISOString());
  
  // Check if still valid
  const now = Math.floor(Date.now() / 1000);
  if (verified.exp > now) {
    const timeLeft = verified.exp - now;
    console.log("⏳ Time until expiration:", Math.floor(timeLeft / 3600), "hours");
  } else {
    console.log("❌ Token has EXPIRED");
  }
  
} catch (error) {
  console.log("❌ Token verification failed:", error.message);
}
