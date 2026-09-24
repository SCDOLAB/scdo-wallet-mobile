// Test our bytesToBase64
function bytesToBase64(bytes) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : "=";
    result += i + 2 < bytes.length ? chars[b3 & 63] : "=";
  }
  return result;
}

// Test with known 65-byte signature
const testBytes = Buffer.from("vxaeGcbMF2Ld6wyPvNRtnnsxMbjid7weVaqEHG2BqxALFMJ5uxutRtt6I2hXBtoZYPXxQ5fefZ1GGbbASqqiAgE=", "base64");
console.log("decoded len:", testBytes.length);
console.log("our b64:", bytesToBase64(testBytes));
console.log("std b64:", testBytes.toString("base64"));
