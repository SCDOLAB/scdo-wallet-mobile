import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import { getNonce } from './scdo';

const RPC_PORTS = { 1: 8037, 2: 8038, 3: 8039, 4: 8036 };

function toHexAddr(addr) {
  return '0x0' + addr.slice(3);
}

// Manual hex to bytes
function hexToBytes(hex) {
  hex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

// Bytes to base64 (RN-safe, no btoa)
function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[b3 & 63] : '=';
  }
  return result;
}

// Minimal RLP encoder
function encodeSingle(item) {
  if (item === null || item === undefined) return [128];
  if (typeof item === 'number') {
    if (item === 0) return [128];
    const hex = item.toString(16);
    const padded = hex.length % 2 ? '0' + hex : hex;
    const bytes = hexToBytes(padded);
    if (bytes.length === 1 && bytes[0] < 128) return [bytes[0]];
    return [128 + bytes.length, ...bytes];
  }
  if (typeof item === 'string') {
    const bytes = hexToBytes(item);
    if (bytes.length === 1 && bytes[0] < 128) return [bytes[0]];
    return [128 + bytes.length, ...bytes];
  }
  return [128];
}

function rlpEncode(items) {
  const payload = [];
  for (const item of items) payload.push(...encodeSingle(item));
  if (payload.length < 56) {
    return new Uint8Array([192 + payload.length, ...payload]);
  }
  const lenHex = payload.length.toString(16);
  const lenBytes = Array.from(hexToBytes(lenHex));
  return new Uint8Array([247 + lenBytes.length, ...lenBytes, ...payload]);
}

async function broadcastTx(signedTx, fromShard) {
  const res = await fetch(`http://74.208.207.184:${RPC_PORTS[fromShard]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'scdo_addTx', params: [signedTx], id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function signData(data, privateKeyHex) {
  const infoList = [
    data.Type, data.From, data.To, data.Amount, data.AccountNonce,
    data.GasPrice, data.GasLimit, data.Timestamp, data.Payload,
  ];
  const encoded = rlpEncode(infoList);
  const hash = keccak_256(encoded);
  const hashBytes = hexToBytes(hash);

  const privBytes = hexToBytes(privateKeyHex);
  const [sigBytes, recovery] = secp.signSync(hashBytes, privBytes, { der: false, recovered: true });
  const sigBytesArr = new Uint8Array(sigBytes);
  const sigWithV = new Uint8Array([...sigBytesArr, recovery]);
  const sigBase64 = bytesToBase64(sigWithV);
  return { hash, sigBase64 };
}

export async function sendSCDO(privateKeyHex, fromAddress, toAddress, amountSCDO) {
  const nonce = await getNonce(fromAddress);
  const value = Math.floor(parseFloat(amountSCDO) * 1e8);
  const fromShard = parseInt(fromAddress[1]);

  const data = {
    Type: 0,
    From: toHexAddr(fromAddress),
    To: toHexAddr(toAddress),
    Amount: value,
    AccountNonce: nonce + 1,
    GasPrice: 1,
    GasLimit: 21000,
    Timestamp: 0,
    Payload: null,
  };

  const { hash, sigBase64 } = signData(data, privateKeyHex);

  const signedTx = {
    Hash: '0x' + hash,
    Data: data,
    Signature: { Sig: sigBase64 },
  };

  return await broadcastTx(signedTx, fromShard);
}

export async function sendToken(privateKeyHex, fromAddress, toAddress, amountToken, contractAddress) {
  const nonce = await getNonce(fromAddress);
  const fromShard = parseInt(fromAddress[1]);

  const amount = Math.floor(parseFloat(amountToken) * 1e8);
  const payload = '0x' + 'a9059cbb' + toAddress.slice(3).padStart(64, '0') + amount.toString(16).padStart(64, '0');

  const data = {
    Type: 0,
    From: toHexAddr(fromAddress),
    To: toHexAddr(contractAddress),
    Amount: 0,
    AccountNonce: nonce + 1,
    GasPrice: 1,
    GasLimit: 100000,
    Timestamp: 0,
    Payload: payload,
  };

  const { hash, sigBase64 } = signData(data, privateKeyHex);

  const signedTx = {
    Hash: '0x' + hash,
    Data: data,
    Signature: { Sig: sigBase64 },
  };

  return await broadcastTx(signedTx, fromShard);
}
