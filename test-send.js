// Full e2e test: exactly replicate RN code path
const secp = require('@noble/secp256k1');
const { keccak_256 } = require('js-sha3');
const b = require('buffer');
const crypto = require('crypto');
global.Buffer = b.Buffer;

// Set HMAC-DRBG for @noble/secp256k1
secp.utils.hmacSha256Sync = (key, ...msgs) => {
  const h = crypto.createHmac('sha256', Buffer.from(key));
  msgs.forEach(m => h.update(Buffer.from(m)));
  return h.digest();
};

// === Replicate transaction.js ===
function hexToBytes(hex) {
  hex = hex.replace('0x', '');
  if (hex.length % 2) hex = '0' + hex;
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return result;
}

function numberToBytes(n) {
  if (!n) return new Uint8Array(0);
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return hexToBytes(hex);
}

function concatBytes(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) { result.set(arr, offset); offset += arr.length; }
  return result;
}

function encodeLength(offset, len) {
  if (len < 56) return new Uint8Array([offset + len]);
  const lenBytes = numberToBytes(len);
  const result = new Uint8Array(lenBytes.length + 1);
  result[0] = offset + 55 + lenBytes.length;
  result.set(lenBytes, 1);
  return result;
}

function rlpEncode(input) {
  if (input === null || input === undefined) return new Uint8Array(0);
  if (typeof input === 'number') return rlpEncode(numberToBytes(input));
  if (typeof input === 'string') {
    if (input.startsWith('0x')) return rlpEncode(hexToBytes(input));
    return rlpEncode(new TextEncoder().encode(input));
  }
  if (input instanceof Uint8Array) {
    if (input.length === 1 && input[0] < 0x80) return input;
    return concatBytes(encodeLength(0x80, input.length), input);
  }
  if (Array.isArray(input)) {
    const payload = concatBytes(...input.map(rlpEncode));
    return concatBytes(encodeLength(0xc0, payload.length), payload);
  }
  return new Uint8Array(0);
}

function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i], b2 = bytes[i+1], b3 = bytes[i+2];
    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += b2 !== undefined ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += b3 !== undefined ? chars[b3 & 63] : '=';
  }
  return result;
}

// === Replicate wallet.js ===
function deriveAddresses(privKeyBytes) {
  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const pubKeyRaw = Buffer.from(pubKeyBytes).slice(1);
  const rlpPubKey = Buffer.concat([Buffer.from([0xb8, 0x40]), pubKeyRaw]);
  const hashHex = keccak_256(rlpPubKey);
  const addrHex = hashHex.slice(-40);
  const rawAddress = '0x' + addrHex;
  const b = Buffer.from(addrHex, 'hex');
  b[0] = 1;
  b[19] = b[19] & 0xF0 | 1;
  const address = '1S' + b.toString('hex');
  return { address, rawAddress };
}

// === RPC ===
const SHARDS = [
  { id: 1, rpc: 'http://74.208.207.184:8037' },
  { id: 2, rpc: 'http://74.208.207.184:8038' },
  { id: 3, rpc: 'http://74.208.207.184:8039' },
  { id: 4, rpc: 'http://74.208.207.184:8036' },
];

async function rpc(shardId, method, params = []) {
  const shard = SHARDS.find(s => s.id === shardId) || SHARDS[0];
  const res = await fetch(shard.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(method + ': ' + data.error.message);
  return data.result;
}

async function main() {
  // Use the test wallet I generated earlier
  const privKeyHex = '0x0c03936adaf28d8355a02bef0d3cdaf0f7b09157763cbc1eaa8b969456c209ec';
  const privBytes = hexToBytes(privKeyHex);
  const { address, rawAddress } = deriveAddresses(privBytes);

  console.log('=== Wallet Info ===');
  console.log('Human address:', address);
  console.log('Raw address:', rawAddress);

  // Check balance
  const bal = await rpc(1, 'scdo_getBalance', [address, '', -1]);
  console.log('\nBalance:', bal);

  const nonce = await rpc(1, 'scdo_getAccountNonce', [address, '', -1]);
  console.log('Nonce:', nonce);

  // Test vector verification
  console.log('\n=== Test Vector ===');
  const testList = [0, '0x724fdfef2ea6411d6fed3bb95bad56da4170e0e1', '0x27266c2b5706e9282546750764531c71052e0281', 0, 0, 10, 200000, 0, '0x0101'];
  const testEnc = rlpEncode(testList);
  const testHash = keccak_256(Array.from(testEnc));
  console.log('Test hash:', '0x' + testHash);
  console.log('Expected:  0xcaa03e211b3e89b991f8f1c1cff4d8640611eae4f634d435704c7ad2b42d08c4');
  console.log('Match:', '0x' + testHash === '0xcaa03e211b3e89b991f8f1c1cff4d8640611eae4f634d435704c7ad2b42d08c4');

  // Now test actual transaction building
  // Send 1 SCDO to the old wallet address
  const toHuman = '1S013549ef290de3fc4ace30d302a417161e63a511';
  // For To, strip "1S" and use as raw
  const toRaw = '0x' + toHuman.slice(2);

  // Try with human-readable address bytes (b[0]=shard, b[19] has type bit)
  const fromHumanBytes = '0x' + address.slice(2);
  const txData = {
    Type: 0,
    From: fromHumanBytes,
    To: toRaw,
    Amount: 100000000, // 1 SCDO in 1e8 units
    AccountNonce: nonce,
    GasPrice: 1,
    GasLimit: 21000,
    Timestamp: 0,
    Payload: '0x',
  };

  console.log('\n=== Transaction Data ===');
  console.log(JSON.stringify(txData, null, 2));

  const list = [
    txData.Type, txData.From, txData.To, txData.Amount,
    txData.AccountNonce, txData.GasPrice, txData.GasLimit,
    txData.Timestamp, txData.Payload,
  ];
  const encoded = rlpEncode(list);
  const hashHex = keccak_256(Array.from(encoded));
  const txHash = '0x' + hashHex;

  console.log('\nRLP encoded:', Buffer.from(encoded).toString('hex'));
  console.log('Tx hash:', txHash);

  // Sign
  const hashBytes = hexToBytes(hashHex);
  const [sigBytes, recovery] = secp.signSync(hashBytes, privBytes, { recovered: true });
  console.log('\nRecovery:', recovery);
  console.log('r:', Buffer.from(sigBytes.slice(0,32)).toString('hex'));
  console.log('s:', Buffer.from(sigBytes.slice(32,64)).toString('hex'));

  // Try v = recovery (0/1) and v = recovery + 27 (Ethereum style)
  for (const v of [recovery, recovery + 27]) {
    const sigBuf = new Uint8Array(sigBytes.length + 1);
    sigBuf.set(sigBytes);
    sigBuf[sigBytes.length] = v;
    const base64Sig = bytesToBase64(sigBuf);
    console.log('\n--- Trying v =', v, '---');
    console.log('Sig (base64):', base64Sig);
    try {
      const result = await rpc(1, 'scdo_addTx', [{
        Data: txData,
        Hash: txHash,
        Signature: { Sig: base64Sig, Pubkey: '' },
      }]);
      console.log('Result:', result);
      break;
    } catch (e) {
      console.log('Error:', e.message.substring(0, 200));
    }
  }

  // Broadcast
  console.log('\n=== Broadcasting ===');
  try {
    const result = await rpc(1, 'scdo_addTx', [{
      Data: txData,
      Hash: txHash,
      Signature: { Sig: base64Sig, Pubkey: '' },
    }]);
    console.log('Result:', result);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

main().catch(e => console.error('Fatal:', e));
