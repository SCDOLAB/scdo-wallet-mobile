const crypto = require("crypto");
const { sha256 } = require("js-sha256");

// Our HMAC
function ourHmac(key, ...msgs) {
  const blockSize = 64;
  let k = Array.from(key);
  if (k.length > blockSize) k = Array.from(sha256.array(k));
  while (k.length < blockSize) k.push(0);
  const ipad = k.map(b => b ^ 0x36);
  const opad = k.map(b => b ^ 0x5c);
  const msgBytes = msgs.flatMap(m => Array.from(m));
  const inner = new Uint8Array([...ipad, ...msgBytes]);
  const innerHash = sha256.array(inner);
  const outer = new Uint8Array([...opad, ...innerHash]);
  return new Uint8Array(sha256.array(outer));
}

// Test with known values
const key = Buffer.alloc(32, 1);
const msg1 = Buffer.from("hello");
const msg2 = Buffer.from("world");

const ours = Buffer.from(ourHmac(key, msg1, msg2));
const std = crypto.createHmac("sha256", key).update(msg1).update(msg2).digest();

console.log("ours:", ours.toString("hex"));
console.log("std: ", std.toString("hex"));
console.log("match:", ours.equals(std));
