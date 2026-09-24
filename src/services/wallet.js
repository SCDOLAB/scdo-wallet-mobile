import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';

export async function createWallet() {
  const privKeyBytes = secp.utils.randomPrivateKey();
  const privateKey = '0x' + Buffer.from(privKeyBytes).toString('hex');

  // Get uncompressed public key (65 bytes, starts with 0x04), strip prefix → 64 bytes
  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const pubKeyRaw = Buffer.from(pubKeyBytes).slice(1); // 64 bytes

  // SCDO address derivation: RLP-encode the 64-byte pubkey, then keccak256
  // RLP encode a 64-byte string: 0xb8 0x40 + data
  const rlpPubKey = Buffer.concat([Buffer.from([0xb8, 0x40]), pubKeyRaw]);
  const hashHex = keccak_256(rlpPubKey);
  const addrHex = hashHex.slice(-40);
  const addressBytes = Buffer.from(addrHex, 'hex');

  // Derive addresses for all 4 shards
  const addresses = {};
  for (let shard = 1; shard <= 4; shard++) {
    const b = Buffer.from(addressBytes);
    b[0] = shard;
    b[19] = b[19] & 0xF0 | 1;
    addresses[`shard${shard}`] = shard + 'S' + b.toString('hex');
  }

  // Default to shard 1
  const address = addresses.shard1;

  return { privateKey, address, addresses };
}

export async function saveWallet(privateKey, address) {
  await SecureStore.setItemAsync('scdo_privkey', privateKey);
  await SecureStore.setItemAsync('scdo_address', address);
}

export async function loadPrivateKey() {
  return await SecureStore.getItemAsync('scdo_privkey');
}

export async function loadAddress() {
  return await SecureStore.getItemAsync('scdo_address');
}

export async function deleteWallet() {
  await SecureStore.deleteItemAsync('scdo_privkey');
  await SecureStore.deleteItemAsync('scdo_address');
}

export async function hasWallet() {
  const key = await SecureStore.getItemAsync('scdo_privkey');
  return !!key;
}

export async function importWallet(privateKeyHex) {
  const normalized = privateKeyHex.startsWith('0x') ? privateKeyHex : '0x' + privateKeyHex;
  const privKeyBytes = Buffer.from(normalized.replace('0x', ''), 'hex');
  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const pubKeyRaw = Buffer.from(pubKeyBytes).slice(1);
  const rlpPubKey = Buffer.concat([Buffer.from([0xb8, 0x40]), pubKeyRaw]);
  const hashHex = keccak_256(rlpPubKey);
  const addrHex = hashHex.slice(-40);
  const addressBytes = Buffer.from(addrHex, 'hex');
  const b = Buffer.from(addressBytes);
  b[0] = 1;
  b[19] = b[19] & 0xF0 | 1;
  const address = '1S' + b.toString('hex');
  await saveWallet(normalized, address);
  return address;
}
