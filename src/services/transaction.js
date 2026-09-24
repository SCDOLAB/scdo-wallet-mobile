import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';
import rlp from 'rlp';
import { getNonce } from './scdo';

const RPC_PORTS = { 1: 8037, 2: 8038, 3: 8039, 4: 8036 };

function toHexAddr(addr) {
  return '0x0' + addr.slice(3);
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
  const encoded = rlp.encode(infoList);
  const hash = keccak_256(encoded);

  const priv = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
  const hashBuf = Buffer.from(hash, 'hex');
  const [sigBytes, recovery] = secp.signSync(hashBuf, priv, { der: false, recovered: true });
  const sigBase64 = Buffer.concat([Buffer.from(sigBytes), Buffer.from([recovery])]).toString('base64');
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
