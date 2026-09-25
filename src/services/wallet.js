import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';

// Compute shard number from OnChain address (matches official wallet)
function getShardFromOnChain(hexAddr) {
  const bytes = [];
  for (let i = 0; i < 40; i += 2) {
    bytes.push(parseInt(hexAddr.substr(i, 2), 16));
  }
  let sum = 0;
  for (let i = 0; i < 18; i++) sum += bytes[i];
  // bytes 18-19 as uint16 BE
  let tail = (bytes[18] << 8) | bytes[19];
  sum += (tail >> 4);
  return (sum % 4) + 1;
}

// Derive OnChain address and human-readable address from private key
function deriveAddresses(privKeyBytes) {
  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const publicKey = '0x' + Buffer.from(pubKeyBytes).toString('hex');

  // Get 64-byte pubkey without 0x04 prefix
  const pubKeyRaw = Buffer.from(pubKeyBytes).slice(1);

  // RLP encode: single byte list
  const rlpPubKey = Buffer.concat([Buffer.from([0xb8, 0x40]), pubKeyRaw]);
  const hashHex = keccak_256(rlpPubKey);
  const addrHex = hashHex.slice(-40); // last 20 bytes

  // Modify last byte: address[19] = address[19] & 0xF0 | 1
  const addrBytes = Buffer.from(addrHex, 'hex');
  addrBytes[19] = (addrBytes[19] & 0xF0) | 1;
  const onChainAddr = '0x' + addrBytes.toString('hex');

  // Human-readable: shard + "S" + hex
  const shard = getShardFromOnChain(addrBytes.toString('hex'));
  const address = shard + 'S' + addrBytes.toString('hex');

  return { publicKey, address, onChainAddr };
}

export async function createWallet() {
  const privKeyBytes = secp.utils.randomPrivateKey();
  const privateKey = '0x' + Buffer.from(privKeyBytes).toString('hex');
  const { publicKey, address, onChainAddr } = deriveAddresses(privKeyBytes);
  await saveWallet(privateKey, publicKey, address, onChainAddr);
  return { privateKey, publicKey, address };
}

export async function saveWallet(privateKey, publicKey, address, onChainAddr) {
  await SecureStore.setItemAsync('scdo_privkey', privateKey);
  await SecureStore.setItemAsync('scdo_pubkey', publicKey);
  await SecureStore.setItemAsync('scdo_address', address);
  await SecureStore.setItemAsync('scdo_onchain_addr', onChainAddr);
}

export async function loadPrivateKey() {
  return await SecureStore.getItemAsync('scdo_privkey');
}

export async function loadPublicKey() {
  return await SecureStore.getItemAsync('scdo_pubkey');
}

export async function loadAddress() {
  return await SecureStore.getItemAsync('scdo_address');
}

export async function loadOnChainAddress() {
  return await SecureStore.getItemAsync('scdo_onchain_addr');
}

export async function deleteWallet() {
  await SecureStore.deleteItemAsync('scdo_privkey');
  await SecureStore.deleteItemAsync('scdo_pubkey');
  await SecureStore.deleteItemAsync('scdo_address');
  await SecureStore.deleteItemAsync('scdo_onchain_addr');
}

export async function hasWallet() {
  const key = await SecureStore.getItemAsync('scdo_privkey');
  return !!key;
}

export async function importWallet(privateKeyHex) {
  const normalized = privateKeyHex.startsWith('0x') ? privateKeyHex : '0x' + privateKeyHex;
  const privKeyBytes = Buffer.from(normalized.replace('0x', ''), 'hex');
  const { publicKey, address, onChainAddr } = deriveAddresses(privKeyBytes);
  await saveWallet(normalized, publicKey, address, onChainAddr);
  return address;
}

// Convert human-readable address (1S...) to OnChain address (0x...)
export function humanToOnChain(humanAddr) {
  // Format: shard + "S" + 40 hex chars
  const sIdx = humanAddr.indexOf('S');
  return '0x' + humanAddr.slice(sIdx + 1);
}
