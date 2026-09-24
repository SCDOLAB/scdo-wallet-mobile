import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';

// Derive both human-readable address and raw on-chain address
function deriveAddresses(privKeyBytes) {
  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const publicKey = '0x' + Buffer.from(pubKeyBytes).toString('hex');

  // SCDO address derivation: RLP-encode the 64-byte pubkey, then keccak256
  const pubKeyRaw = Buffer.from(pubKeyBytes).slice(1); // 64 bytes
  const rlpPubKey = Buffer.concat([Buffer.from([0xb8, 0x40]), pubKeyRaw]);
  const hashHex = keccak_256(rlpPubKey);
  const addrHex = hashHex.slice(-40); // original 20 bytes

  // Raw on-chain address (for transaction RLP)
  const rawAddress = '0x' + addrHex;

  // Human-readable address (for RPC calls and display)
  const b = Buffer.from(addrHex, 'hex');
  b[0] = 1; // shard 1
  b[19] = b[19] & 0xF0 | 1;
  const address = '1S' + b.toString('hex');

  return { publicKey, address, rawAddress };
}

export async function createWallet() {
  const privKeyBytes = secp.utils.randomPrivateKey();
  const privateKey = '0x' + Buffer.from(privKeyBytes).toString('hex');
  const { publicKey, address, rawAddress } = deriveAddresses(privKeyBytes);
  await saveWallet(privateKey, publicKey, address, rawAddress);
  return { privateKey, publicKey, address };
}

export async function saveWallet(privateKey, publicKey, address, rawAddress) {
  await SecureStore.setItemAsync('scdo_privkey', privateKey);
  await SecureStore.setItemAsync('scdo_pubkey', publicKey);
  await SecureStore.setItemAsync('scdo_address', address);
  await SecureStore.setItemAsync('scdo_raw_address', rawAddress);
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

export async function loadRawAddress() {
  return await SecureStore.getItemAsync('scdo_raw_address');
}

export async function deleteWallet() {
  await SecureStore.deleteItemAsync('scdo_privkey');
  await SecureStore.deleteItemAsync('scdo_pubkey');
  await SecureStore.deleteItemAsync('scdo_address');
  await SecureStore.deleteItemAsync('scdo_raw_address');
}

export async function hasWallet() {
  const key = await SecureStore.getItemAsync('scdo_privkey');
  return !!key;
}

export async function importWallet(privateKeyHex) {
  const normalized = privateKeyHex.startsWith('0x') ? privateKeyHex : '0x' + privateKeyHex;
  const privKeyBytes = Buffer.from(normalized.replace('0x', ''), 'hex');
  const { publicKey, address, rawAddress } = deriveAddresses(privKeyBytes);
  await saveWallet(normalized, publicKey, address, rawAddress);
  return address;
}
