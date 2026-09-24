import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import rlp from 'rlp';
import { getNonce, getShardFromAddress } from './scdo';

const RPC_PORTS = { 1: 8037, 2: 8038, 3: 8039, 4: 8036 };

function toBuffer(n) {
  if (n === 0) return Buffer.from([]);
  return Buffer.from(n.toString(16).padStart(64, '0'), 'hex');
}

export async function signAndSend(privateKeyHex, fromAddress, toAddress, amountSCDO) {
  const privKeyBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
  const nonce = await getNonce(fromAddress);
  const value = Math.floor(parseFloat(amountSCDO) * 1e8);
  const gasPrice = 1;
  const gasLimit = 21000;

  const fromShard = getShardFromAddress(fromAddress);
  const toShard = getShardFromAddress(toAddress);
  const toBytes = Buffer.from(toAddress.slice(2), 'hex');

  // SCDO unsigned tx structure
  const rawTx = [
    toBuffer(nonce),
    toBuffer(gasPrice),
    toBuffer(gasLimit),
    toBytes,
    toBuffer(value),
    Buffer.from([fromShard]),
    Buffer.from([toShard]),
    Buffer.from([]),
  ];

  const encoded = rlp.encode(rawTx);
  const hash = Buffer.from(keccak_256(encoded), 'hex');
  const sig = secp.signSync(hash, privKeyBytes, { canonical: true });
  const v = 27 + (sig[64] || 0);

  const signedTx = [...rawTx, Buffer.from([v]), sig.slice(0, 32), sig.slice(32, 64)];
  const serialized = '0x' + rlp.encode(signedTx).toString('hex');

  const res = await fetch(`http://74.208.207.184:${RPC_PORTS[fromShard]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'scdo_addTx', params: [serialized], id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
