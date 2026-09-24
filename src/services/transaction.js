import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import RLP from 'rlp';
import { rpc, getNonce, getShardFromAddress, TOKENS } from './scdo';

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
        Buffer.from(txData.From.slice(2), 'hex'),
        Buffer.from(txData.To.slice(2), 'hex'),
        txData.Amount,
        txData.AccountNonce,
        txData.GasPrice,
        txData.GasLimit,
        txData.Timestamp,
        txData.Payload ? Buffer.from(txData.Payload.slice(2), 'hex') : Buffer.from([]),
      ];
      const encoded = RLP.encode(list);
      const txHash = '0x' + keccak_256(encoded);

      const hashBytes = Buffer.from(keccak_256(encoded), 'hex');
      const [sigBytes, recovery] = secp.signSync(hashBytes, privKeyBytes, { recovered: true });
      const sigBuf = Buffer.concat([Buffer.from(sigBytes), Buffer.from([recovery])]);
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
