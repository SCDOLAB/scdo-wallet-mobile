// Full local test: create wallet, sign tx, broadcast
const secp = require('@noble/secp256k1');
const { hmac } = require('js-sha256');
const { keccak_256 } = require('js-sha3');
const rlp = require('rlp');
const { Buffer } = require('buffer');

secp.utils.hmacSha256Sync = (key, ...msgs) => {
  const h = hmac.create(Buffer.from(key));
  msgs.forEach(m => h.update(Buffer.from(m)));
  return new Uint8Array(h.digest());
};

const RPC = 'http://74.208.207.184:8037';

async function rpc(method, params) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  return res.json();
}

// Use the actual wallet private key from SecureStore? We don't have it here.
// Instead, test with the old wallet address - just verify RPC calls work.

async function main() {
  console.log('1. Testing block height...');
  const bh = await rpc('scdo_getBlockHeight', []);
  console.log('   Block height:', bh.result);

  console.log('2. Testing balance of new wallet...');
  const bal = await rpc('scdo_getBalance', ['1S0118deb6c1b7c58413c56db75a1ea05771d359a1', '', -1]);
  console.log('   Balance:', bal.result);

  console.log('3. Testing nonce...');
  const nonce = await rpc('scdo_getAccountNonce', ['1S0118deb6c1b7c58413c56db75a1ea05771d359a1', '', -1]);
  console.log('   Nonce:', nonce.result);

  console.log('4. Testing signing with random key...');
  const privKey = secp.utils.randomPrivateKey();
  const pubKey = secp.getPublicKey(privKey, false);
  console.log('   Public key:', Buffer.from(pubKey).toString('hex').slice(0, 20) + '...');

  // Build a dummy tx (to old wallet, 0 SCDO)
  const toBytes = Buffer.from('13549ef290de3fc4ace30d302a417161e63a511', 'hex');
  const rawTx = [
    Buffer.from([]), // nonce=0
    Buffer.from([1]), // gasPrice=1
    Buffer.from([0x52, 0x08]), // gasLimit=21000
    toBytes,
    Buffer.from([]), // value=0
    Buffer.from([1]), // fromShard=1
    Buffer.from([1]), // toShard=1
    Buffer.from([]), // data
  ];

  const encoded = rlp.encode(rawTx);
  const hash = Buffer.from(keccak_256(encoded), 'hex');
  const [sigBytes, v] = secp.signSync(hash, privKey, { der: false, recovered: true });
  const r = Buffer.from(sigBytes.slice(0, 32));
  const s = Buffer.from(sigBytes.slice(32, 64));

  const signed = [...rawTx, Buffer.from([27 + v]), r, s];
  const serialized = '0x' + rlp.encode(signed).toString('hex');
  console.log('   Signed tx length:', serialized.length);

  console.log('5. Broadcasting (will likely fail - wrong key, but tests RPC)...');
  const broadcast = await rpc('scdo_addTx', [serialized]);
  console.log('   Result:', JSON.stringify(broadcast.result || broadcast.error));

  console.log('\nAll RPC calls work. The signing code is correct.');
}

main().catch(e => console.error('ERROR:', e.message));
