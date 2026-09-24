import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { importWallet } from '../services/wallet';

export default function ImportWalletScreen({ navigation }) {
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }
    setLoading(true);
    try {
      const addr = await importWallet(privateKey.trim());
      Alert.alert('Wallet Imported!', `Address:\n${addr}`, [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.subtitle}>Paste your private key to restore access</Text>
      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        placeholder="0x..."
        multiline
        value={privateKey}
        onChangeText={setPrivateKey}
        placeholderTextColor="#555"
      />
      <TouchableOpacity style={styles.button} onPress={handleImport} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Importing...' : 'Import'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0E11' },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8B8D98', marginBottom: 32 },
  input: { backgroundColor: '#1A1D24', borderRadius: 12, padding: 16, fontSize: 14, color: '#fff' },
  button: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#8B8D98', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
