// Test SCDO wallet core logic
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const secp = require('@noble/secp256k1');
const { keccak_256 } = require('js-sha3');
const { Buffer } = require('buffer');

// Test 1: Address derivation from known private key
console.log('=== Test 1: Address Derivation ===');
// Use the known private key that produces 1S01719c9c8cb99a6c95b738d2cf21fc0a901
const testPrivKey = '0x5d4f3a7b8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5';

async function testDerivation() {
  const privBytes = Buffer.from(testPrivKey.replace('0x', ''), 'hex');
  const pubBytes = secp.getPublicKey(privBytes, false);
  const pubRaw = Buffer.from(pubBytes).slice(1); // 64 bytes
  const rlpPub = Buffer.concat([Buffer.from([0xb8, 0x40]), pubRaw]);
  const hashHex = keccak_256(rlpPub);
  const addrHex = hashHex.slice(-40);
  const addrBytes = Buffer.from(addrHex, 'hex');
  const b = Buffer.from(addrBytes);
  b[0] = 1;
  b[19] = b[19] & 0xF0 | 1;
  const address = '1S' + b.toString('hex');
  console.log('Derived address:', address);
}

// Test 2: Balance RPC
async function testBalance() {
  console.log('\n=== Test 2: Balance Query ===');
  const addr = '1S01719c9c8cb99a6c95b738d2cf21fc0a901';
  try {
    const res = await fetch('http://74.208.207.184:8037', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'scdo_getBalance',
        params: [addr, '', -1],
        id: 1
      })
    });
    const data = await res.json();
    console.log('Balance result:', JSON.stringify(data.result));
    if (data.result && data.result.Balance) {
      const balance = parseInt(data.result.Balance) / 1e8;
      console.log('Balance SCDO:', balance.toFixed(8));
    }
  } catch (e) {
    console.log('RPC error:', e.message);
  }
}

// Test 3: Nonce RPC
async function testNonce() {
  console.log('\n=== Test 3: Nonce Query ===');
  const addr = '1S01719c9c8cb99a6c95b738d2cf21fc0a901';
  try {
    const res = await fetch('http://74.208.207.184:8037', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'scdo_getAccountNonce',
        params: [addr, '', -1],
        id: 1
      })
    });
    const data = await res.json();
    console.log('Nonce:', data.result);
  } catch (e) {
    console.log('RPC error:', e.message);
  }
}

// Run tests
(async () => {
  await testDerivation();
  await testBalance();
  await testNonce();
})();
