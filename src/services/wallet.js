import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = '@scdo_wallet';

// Generate a new private key (uses scdo.js SDK)
export async function createWallet() {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  const keypair = client.wallet.create();
  return {
    privateKey: keypair.privatekey,
    publicKey: keypair.publickey,
  };
}

// Get shard number from public key
export async function getShardNum(publicKey) {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  return client.wallet.getshardnum(publicKey);
}

// Save private key securely
export async function savePrivateKey(privateKey) {
  await SecureStore.setItemAsync('scdo_privkey', privateKey);
}

// Load private key
export async function loadPrivateKey() {
  return await SecureStore.getItemAsync('scdo_privkey');
}

// Delete wallet
export async function deleteWallet() {
  await SecureStore.deleteItemAsync('scdo_privkey');
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// Check if wallet exists
export async function hasWallet() {
  const key = await SecureStore.getItemAsync('scdo_privkey');
  return !!key;
}

// Derive address from public key (display format)
export async function getAddressFromPublicKey(publicKey) {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  const shard = client.wallet.getshardnum(publicKey);
  const clean = publicKey.replace(/^0x/, '');
  return `${shard}S${clean}`;
}

// Sign and prepare transaction
export async function signTransaction(privateKey, rawTx) {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  return client.generateTx(privateKey, rawTx);
}
