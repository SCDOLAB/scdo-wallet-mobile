import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import { rpc, getNonce, getShardFromAddress, TOKENS } from './scdo';

const nonceTracker = {};

// RLP encoder
function rlpEncode(input) {
  if (typeof input === 'number' || typeof input === 'bigint') {
    const buf = Buffer.from(input.toString(16).padStart(64, '0'), 'hex');
    return rlpEncode(buf);
  }
  if (Buffer.isBuffer(input)) {
    if (input.length === 1 && input[0] < 0x80) return input;
    return Buffer.concat([encodeLength(0x80, input.length), input]);
  }
  if (Array.isArray(input)) {
    const payload = Buffer.concat(input.map(rlpEncode));
    return Buffer.concat([encodeLength(0xc0, payload.length), payload]);
  }
  return rlpEncode(Buffer.from(String(input), 'utf8'));
}

function encodeLength(offset, len) {
  if (len < 56) return Buffer.from([offset + len]);
  const lenBuf = Buffer.from(len.toString(16).padStart(2 * Math.ceil(len.toString(16).length / 2), '0'), 'hex');
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

function toHexAddr(addr) {
  return '0x' + addr.slice(2);
}

async function sendWithRetry(chainId, txData, privKeyBytes, maxRetries = 3) {
  const from = txData.From;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const encoded = rlpEncode([
        txData.Type, txData.From, txData.To, txData.Amount,
        txData.AccountNonce, txData.GasPrice, txData.GasLimit,
        txData.Timestamp, txData.Payload,
      ]);
      const txHash = '0x' + keccak_256(encoded);
      const sig = secp.signSync(Buffer.from(keccak_256(encoded), 'hex'), privKeyBytes);
      const sigBytes = Buffer.concat([sig.toCompactRawBytes(), Buffer.from([sig.recovery])]);
      const base64Sig = bytesToBase64(sigBytes);

      const res = await rpc(chainId, 'scdo_addTx', [{
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
  const privBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
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
  const privBytes = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
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
