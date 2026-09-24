import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = '@scdo_wallet';

// Generate a new wallet
export async function createWallet() {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  const keypair = client.wallet.create();
  return {
    privateKey: keypair.privatekey,
    address: keypair.publickey, // already in display format e.g. "1S01..."
  };
}

// Save wallet (private key + address) securely
export async function saveWallet(privateKey, address) {
  await SecureStore.setItemAsync('scdo_privkey', privateKey);
  await SecureStore.setItemAsync('scdo_address', address);
}

// Load private key
export async function loadPrivateKey() {
  return await SecureStore.getItemAsync('scdo_privkey');
}

// Load saved address
export async function loadAddress() {
  return await SecureStore.getItemAsync('scdo_address');
}

// Delete wallet
export async function deleteWallet() {
  await SecureStore.deleteItemAsync('scdo_privkey');
  await SecureStore.deleteItemAsync('scdo_address');
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// Check if wallet exists
export async function hasWallet() {
  const key = await SecureStore.getItemAsync('scdo_privkey');
  return !!key;
}

// Sign and prepare transaction
export async function signTransaction(privateKey, rawTx) {
  const Scdo = require('scdo.js');
  const client = new Scdo();
  return client.generateTx(privateKey, rawTx);
}
