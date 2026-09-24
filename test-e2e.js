// End-to-end test: create wallet -> getBalance -> sign tx -> broadcast
const secp = require('@noble/secp256k1');
const { keccak_256 } = require('js-sha3');
const b = require('buffer');
global.Buffer = b.Buffer;

const SHARDS = [
  { id: 1, rpc: 'http://74.208.207.184:8037' },
  { id: 2, rpc: 'http://74.208.207.184:8038' },
  { id: 3, rpc: 'http://74.208.207.184:8039' },
  { id: 4, rpc: 'http://74.208.207.184:8036' },
];

function getShardFromAddress(addr) { return parseInt(addr[0]); }

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

// RLP encoder
function rlpEncode(input) {
  if (input === null || input === undefined) return Buffer.from([]);
  if (Buffer.isBuffer(input)) {
    if (input.length === 1 && input[0] < 0x80) return input;
    return Buffer.concat([encodeLength(0x80, input.length), input]);
  }
  if (typeof input === 'number') {
    if (input === 0) return Buffer.from([]);
    const hex = input.toString(16);
    return rlpEncode(Buffer.from(hex.length % 2 ? '0' + hex : hex, 'hex'));
  }
  if (typeof input === 'string') {
    if (input.startsWith('0x')) return rlpEncode(Buffer.from(input.slice(2), 'hex'));
    return rlpEncode(Buffer.from(input, 'utf8'));
  }
  if (Array.isArray(input)) {
    const payload = Buffer.concat(input.map(rlpEncode));
    return Buffer.concat([encodeLength(0xc0, payload.length), payload]);
  }
  return rlpEncode(Buffer.from([]));
}
function encodeLength(offset, len) {
  if (len < 56) return Buffer.from([offset + len]);
  const lenHex = len.toString(16);
  const lenBuf = Buffer.from(lenHex.length % 2 ? '0' + lenHex : lenHex, 'hex');
  return Buffer.concat([Buffer.from([offset + 55 + lenBuf.length]), lenBuf]);
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

// Generate wallet
function createWallet() {
  const privBytes = secp.utils.randomPrivateKey();
  const privateKey = '0x' + Buffer.from(privBytes).toString('hex');
  const pubBytes = secp.getPublicKey(privBytes, false);
  const raw = Buffer.from(pubBytes).slice(1);
  const rlp = Buffer.concat([Buffer.from([0xb8, 0x40]), raw]);
  const h = keccak_256(rlp);
  const addrHex = h.slice(-40);
  const ab = Buffer.from(addrHex, 'hex');
  ab[0] = 1;
  ab[19] = ab[19] & 0xF0 | 1;
  const address = '1S' + ab.toString('hex');
  return { privateKey, address, privBytes };
}

async function test() {
  console.log('=== Step 1: Create wallet ===');
  const w = createWallet();
  console.log('Address:', w.address, '(len:', w.address.length + ')');
  console.log('PrivateKey:', w.privateKey);

  console.log('\n=== Step 2: Query balance ===');
  try {
    const bal = await rpc(1, 'scdo_getBalance', [w.address, '', -1]);
    console.log('Balance result:', bal);
  } catch (e) { console.log('Balance error:', e.message); }

  console.log('\n=== Step 3: Query nonce ===');
  try {
    const nonce = await rpc(1, 'scdo_getAccountNonce', [w.address, '', -1]);
    console.log('Nonce:', nonce);
  } catch (e) { console.log('Nonce error:', e.message); }

  console.log('\n=== Step 4: Test with known funded address ===');
  const funded = '1S013549ef290de3fc4ace30d302a417161e63a511';
  try {
    const bal = await rpc(1, 'scdo_getBalance', [funded, '', -1]);
    console.log('Funded balance:', bal);
  } catch (e) { console.log('Error:', e.message); }

  try {
    const nonce = await rpc(1, 'scdo_getAccountNonce', [funded, '', -1]);
    console.log('Funded nonce:', nonce);
  } catch (e) { console.log('Error:', e.message); }

  // Test signing a tx from the funded address (we don't have its private key,
  // but we can verify the hash computation is correct by checking against
  // a known tx hash from the explorer)
  console.log('\n=== Step 5: Verify tx hash computation ===');
  // Test with known values from old wallet docs:
  // From: 0x724fdfef2ea6411d6fed3bb95bad56da4170e0e1
  // To: 0x27266c2b5706e9282546750764531c71052e0281
  const testTx = {
    Type: 0,
    From: '0x724fdfef2ea6411d6fed3bb95bad56da4170e0e1',
    To: '0x27266c2b5706e9282546750764531c71052e0281',
    Amount: 0,
    AccountNonce: 0,
    GasPrice: 10,
    GasLimit: 200000,
    Timestamp: 0,
    Payload: '0x0101',
  };
  const list = [
    testTx.Type, testTx.From, testTx.To, testTx.Amount,
    testTx.AccountNonce, testTx.GasPrice, testTx.GasLimit,
    testTx.Timestamp, testTx.Payload,
  ];
  const encoded = rlpEncode(list);
  const hash = keccak_256(encoded);
  console.log('Computed hash:', '0x' + hash);
  console.log('Expected:     0xcaa03e211b3e89b991f8f1c1cff4d8640611eae4f634d435704c7ad2b42d08c4');
  console.log('Match:', '0x' + hash === '0xcaa03e211b3e89b991f8f1c1cff4d8640611eae4f634d435704c7ad2b42d08c4');
}

test().catch(e => console.error('Fatal:', e));
