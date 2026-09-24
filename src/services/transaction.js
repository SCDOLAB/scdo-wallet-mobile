import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import rlp from 'rlp';
import { getNonce } from './scdo';

// Sign and send a SCDO transaction
export async function signAndSend(privateKeyHex, fromAddress, toAddress, amountSCDO) {
  const privKeyBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');

  // Get nonce
  const nonce = await getNonce(fromAddress);

  // SCDO uses 8 decimals
  const value = Math.floor(parseFloat(amountSCDO) * 1e8);

  // Gas price and limit (SCDO defaults)
  const gasPrice = 1;
  const gasLimit = 21000;

  // Parse addresses
  const fromShard = parseInt(fromAddress[0]);
  const toShard = parseInt(toAddress[0]);
  const fromBytes = Buffer.from(fromAddress.slice(2), 'hex');
  const toBytes = Buffer.from(toAddress.slice(2), 'hex');

  // Build transaction (SCDO format: [nonce, gasPrice, gasLimit, to, value, shard, toShard, data, v, r, s])
  // SCDO uses a modified tx structure with shard fields
  const rawTx = [
    Buffer.from(nonce.toString(16), 'hex'),
    Buffer.from(gasPrice.toString(16), 'hex'),
    Buffer.from(gasLimit.toString(16), 'hex'),
    toBytes,
    Buffer.from(value.toString(16).padStart(64, '0'), 'hex'),
    Buffer.from([fromShard]),
    Buffer.from([toShard]),
    Buffer.from([]),
  ];

  // Sign
  const encoded = rlp.encode(rawTx);
  const hash = Buffer.from(keccak_256(encoded), 'hex');

  const sig = secp.signSync(hash, privKeyBytes, { canonical: true });
  const v = 27 + (sig[64] || 0);

  // Final tx with signature
  const signedTx = [...rawTx, Buffer.from([v]), sig.slice(0, 32), sig.slice(32, 64)];
  const serialized = '0x' + rlp.encode(signedTx).toString('hex');

  // Send via RPC
  const shard = fromShard;
  const res = await fetch(`http://74.208.207.184:${8036 + shard}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'scdo_addTx',
      params: [serialized],
      id: 1,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
