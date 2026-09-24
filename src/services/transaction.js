import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import { rpc, getNonce, getShardFromAddress, TOKENS } from './scdo';

function hexToBytes(hex) {
  hex = hex.replace('0x', '');
  if (hex.length % 2) hex = '0' + hex;
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return result;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function numberToBytes(n) {
  if (!n) return new Uint8Array(0);
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return hexToBytes(hex);
}

function rlpEncode(input) {
  if (input === null || input === undefined) return new Uint8Array(0);
  if (typeof input === 'number' || typeof input === 'bigint') {
    return rlpEncode(numberToBytes(Number(input)));
  }
  if (typeof input === 'string') {
    if (input.startsWith('0x')) {
      return rlpEncode(hexToBytes(input));
    }
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

function encodeLength(offset, len) {
  if (len < 56) return new Uint8Array([offset + len]);
  const lenBytes = numberToBytes(len);
  const result = new Uint8Array(lenBytes.length + 1);
  result[0] = offset + 55 + lenBytes.length;
  result.set(lenBytes, 1);
  return result;
}

function concatBytes(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
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

function toHexAddr(addr) {
  return '0x' + addr.slice(2);
}

async function sendWithRetry(shardId, txData, privKeyBytes, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const list = [
        txData.Type,
        txData.From,
        txData.To,
        txData.Amount,
        txData.AccountNonce,
        txData.GasPrice,
        txData.GasLimit,
        txData.Timestamp,
        txData.Payload || '0x',
      ];
      const encoded = rlpEncode(list);
      // Convert Uint8Array to plain array for js-sha3 (Hermes compat)
      const arr = Array.from(encoded);
      const hashHex = keccak_256(arr);
      const txHash = '0x' + hashHex;
      const hashBytes = hexToBytes(hashHex);
      const [sigBytes, recovery] = secp.signSync(hashBytes, privKeyBytes, { recovered: true });
      const sigBuf = new Uint8Array(sigBytes.length + 1);
      sigBuf.set(sigBytes);
      sigBuf[sigBytes.length] = recovery;
      const base64Sig = bytesToBase64(sigBuf);

      const res = await rpc(shardId, 'scdo_addTx', [{
        Data: txData,
        Hash: txHash,
        Signature: { Sig: base64Sig, Pubkey: '' },
      }]);
      return res;
    } catch (e) {
      if (attempt < maxRetries - 1) {
        txData.AccountNonce += 1;
      } else {
        throw e;
      }
    }
  }
}

export async function sendSCDO(privateKeyHex, fromAddress, toAddress, amountSCDO) {
  const privBytes = hexToBytes(privateKeyHex);
  const chainNonce = await getNonce(fromAddress);
  const nonce = chainNonce + 1;
  const shard = getShardFromAddress(fromAddress);

  const txData = {
    Type: 0,
    From: toHexAddr(fromAddress),
    To: toHexAddr(toAddress),
    Amount: Math.floor(parseFloat(amountSCDO) * 1e8),
    AccountNonce: nonce,
    GasPrice: 1,
    GasLimit: 21000,
    Timestamp: 0,
    Payload: null,
  };

  return await sendWithRetry(shard, txData, privBytes);
}

export async function sendToken(privateKeyHex, fromAddress, toAddress, amountToken, contractAddress) {
  const privBytes = hexToBytes(privateKeyHex);
  const chainNonce = await getNonce(fromAddress);
  const nonce = chainNonce + 1;
  const shard = getShardFromAddress(contractAddress);

  const toTokenAddr = toHexAddr(toAddress).slice(2);
  const amountHex = Math.floor(parseFloat(amountToken) * 1e8).toString(16).padStart(64, '0');
  const payload = '0xa9059cbb' + toTokenAddr.padStart(64, '0') + amountHex;

  const txData = {
    Type: 0,
    From: toHexAddr(fromAddress),
    To: toHexAddr(contractAddress),
    Amount: 0,
    AccountNonce: nonce,
    GasPrice: 1,
    GasLimit: 100000,
    Timestamp: 0,
    Payload: payload,
  };

  return await sendWithRetry(shard, txData, privBytes);
}
