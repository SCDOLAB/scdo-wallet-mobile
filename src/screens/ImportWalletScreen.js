import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { savePrivateKey, getAddressFromPublicKey } from '../services/wallet';

export default function ImportWalletScreen({ navigation }) {
  const [privateKey, setPrivateKey] = useState('');

  async function handleImport() {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }
    try {
      const key = privateKey.trim().startsWith('0x') ? privateKey.trim() : '0x' + privateKey.trim();
      await savePrivateKey(key);
      Alert.alert('Success', 'Wallet imported!', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.subtitle}>Enter your private key (hex string)</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="0x..."
        multiline
        value={privateKey}
        onChangeText={setPrivateKey}
      />
      <TouchableOpacity style={styles.button} onPress={handleImport}>
        <Text style={styles.buttonText}>Import</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14 },
  button: { backgroundColor: '#E94D5F', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
