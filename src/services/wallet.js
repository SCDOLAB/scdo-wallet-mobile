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

  addressBytes[0] = 1;
  addressBytes[19] = addressBytes[19] & 0xF0 | 1;
  const address = '1S' + addressBytes.toString('hex');

  return { privateKey, address };
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
