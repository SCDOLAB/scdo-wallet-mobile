import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loadPrivateKey, signTransaction } from '../services/wallet';
import { sendRawTx, fromDisplayAddress } from '../services/scdo';

export default function SendScreen() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!toAddress.trim() || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const { shard } = fromDisplayAddress(toAddress.trim());
      const privKey = await loadPrivateKey();
      setLoading(true);

      const rawTx = {
        From: '0x', // will be derived from priv key
        To: toAddress.trim(),
        Amount: parseFloat(amount) * 1e18,
        AccountNonce: 0, // need to fetch nonce
        GasPrice: 1,
        GasLimit: 300000,
        Timestamp: Math.floor(Date.now() / 1000),
        Payload: '',
      };

      const signedTx = await signTransaction(privKey, rawTx);
      const result = await sendRawTx(signedTx);
      Alert.alert('Success', `Transaction sent!\nHash: ${result}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>To Address</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1S012134..."
        value={toAddress}
        onChangeText={setToAddress}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Amount (SCDO)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.0"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#333', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#E94D5F', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
