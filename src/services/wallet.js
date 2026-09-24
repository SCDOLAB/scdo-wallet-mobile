import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from 'js-sha3';

export async function createWallet() {
  const privKeyBytes = secp.utils.randomSecretKey();
  const privateKey = '0x' + Buffer.from(privKeyBytes).toString('hex');

  const pubKeyBytes = secp.getPublicKey(privKeyBytes, false);
  const pubKeyHex = Buffer.from(pubKeyBytes).toString('hex').slice(2);

  const hashHex = keccak_256(Buffer.from(pubKeyHex, 'hex'));
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
