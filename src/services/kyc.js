import * as SecureStore from 'expo-secure-store';

// KYC storage - local encrypted cache + on-chain contract reference
export async function saveKyc(kycData) {
  await SecureStore.setItemAsync('scdo_kyc', JSON.stringify(kycData));
}

export async function loadKyc() {
  const data = await SecureStore.getItemAsync('scdo_kyc');
  return data ? JSON.parse(data) : null;
}

export async function hasKyc() {
  const data = await SecureStore.getItemAsync('scdo_kyc');
  return !!data;
}

export async function clearKyc() {
  await SecureStore.deleteItemAsync('scdo_kyc');
}

// On-chain KYC contract: KYC data is stored in a smart contract
// keyed by the customer's 1S address, so it can be reused across
// all licensed services without re-KYC.
export async function saveKycContract(contractAddress, txHash) {
  await SecureStore.setItemAsync('scdo_kyc_contract', JSON.stringify({
    contractAddress,
    txHash,
    updatedAt: new Date().toISOString(),
  }));
}

export async function loadKycContract() {
  const data = await SecureStore.getItemAsync('scdo_kyc_contract');
  return data ? JSON.parse(data) : null;
}

// Transaction history
export async function saveTx(tx) {
  const history = await loadTxHistory();
  history.unshift(tx);
  await SecureStore.setItemAsync('scdo_tx_history', JSON.stringify(history.slice(0, 100)));
}

export async function loadTxHistory() {
  const data = await SecureStore.getItemAsync('scdo_tx_history');
  return data ? JSON.parse(data) : [];
}
