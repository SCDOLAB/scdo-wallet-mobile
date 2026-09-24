const secp = require("@noble/secp256k1");
const { keccak_256 } = require("js-sha3");
const crypto = require("crypto");
secp.utils.hmacSha256Sync = (key, msg) => crypto.createHmac("sha256", Buffer.from(key)).update(Buffer.from(msg)).digest();

const hashHex = "8aea674fc6972cbb5439eb7f890628b6ea8de78d891deadc70219cb9025f8507";
const privHex = "0000000000000000000000000000000000000000000000000000000000000001";
const hashBytes = Buffer.from(hashHex, "hex");
const privBytes = Buffer.from(privHex, "hex");
const [sigBytes, recid] = secp.signSync(hashBytes, privBytes, { der: false, recovered: true });
console.log("sig len:", sigBytes.length, "recid:", recid);
console.log("sig+v b64:", Buffer.concat([Buffer.from(sigBytes), Buffer.from([recid])]).toString("base64"));
