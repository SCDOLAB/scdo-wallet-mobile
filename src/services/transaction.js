import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import rlp from 'rlp';
import { getNonce, getShardFromAddress } from './scdo';

const RPC_PORTS = { 1: 8037, 2: 8038, 3: 8039, 4: 8036 };

function toBuffer(n) {
  if (!n || n === 0) return Buffer.from([]);
  return Buffer.from(n.toString(16).padStart(64, '0'), 'hex');
}

async function broadcast(rawTx, fromShard) {
  const serialized = '0x' + rlp.encode(rawTx).toString('hex');
  const res = await fetch(`http://74.208.207.184:${RPC_PORTS[fromShard]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'scdo_addTx', params: [serialized], id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function buildRawTx(nonce, gasPrice, gasLimit, toBytes, value, fromShard, toShard, dataHex) {
  return [
    toBuffer(nonce),
    toBuffer(gasPrice),
    toBuffer(gasLimit),
    toBytes,
    toBuffer(value),
    Buffer.from([fromShard]),
    Buffer.from([toShard]),
    Buffer.from(dataHex, 'hex'),
  ];
}

async function signAndSendTx(rawTx, privKeyBytes) {
  const encoded = rlp.encode(rawTx);
  const hash = Buffer.from(keccak_256(encoded), 'hex');
  const sig = await secp.signAsync(hash, privKeyBytes);
  const r = Buffer.from(sig.r.toBytes('be', 32));
  const s = Buffer.from(sig.s.toBytes('be', 32));
  const v = sig.recovery || 0;
  return [...rawTx, Buffer.from([27 + v]), r, s];
}

// Send native SCDO
export async function sendSCDO(privateKeyHex, fromAddress, toAddress, amountSCDO) {
  const privKeyBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
  const nonce = await getNonce(fromAddress);
  const value = Math.floor(parseFloat(amountSCDO) * 1e8);
  const fromShard = getShardFromAddress(fromAddress);
  const toShard = getShardFromAddress(toAddress);
  const toBytes = Buffer.from(toAddress.slice(2), 'hex');

  const rawTx = buildRawTx(nonce, 1, 21000, toBytes, value, fromShard, toShard, '');
  const signed = await signAndSendTx(rawTx, privKeyBytes);
  return await broadcast(signed, fromShard);
}

// Send ERC20 token (e.g. AUDt)
export async function sendToken(privateKeyHex, fromAddress, toAddress, amountToken, contractAddress) {
  const privKeyBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
  const nonce = await getNonce(fromAddress);
  const fromShard = getShardFromAddress(fromAddress);
  const toShard = getShardFromAddress(toAddress);
  const toBytes = Buffer.from(contractAddress.slice(2), 'hex'); // send to contract

  // ERC20 transfer(address to, uint256 amount)
  const tokenAmount = Math.floor(parseFloat(amountToken) * 1e8);
  const data = 'a9059cbb' +
    toAddress.slice(2).padStart(64, '0') +
    tokenAmount.toString(16).padStart(64, '0');

  const rawTx = buildRawTx(nonce, 1, 100000, toBytes, 0, fromShard, toShard, data);
  const signed = await signAndSendTx(rawTx, privKeyBytes);
  return await broadcast(signed, fromShard);
}
