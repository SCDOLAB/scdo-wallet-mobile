import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createWallet, saveWallet } from '../services/wallet';

export default function CreateWalletScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    setLoading(true);
    try {
      const wallet = await createWallet();
      await saveWallet(wallet.privateKey, wallet.publicKey, wallet.address);
      Alert.alert('Wallet Created!', `Your new address:\n${wallet.address}\n\n⚠️ Back up your private key now!`, [
        { text: 'I Have Backed Up', onPress: () => navigation.replace('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>Create New Wallet</Text>
      <Text style={styles.subtitle}>Secure your wallet with a PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
        placeholderTextColor="#555"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        secureTextEntry
        keyboardType="numeric"
        value={confirmPin}
        onChangeText={setConfirmPin}
        placeholderTextColor="#555"
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Wallet'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ImportWallet')}>
        <Text style={styles.link}>I already have a wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0E11' },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  logoText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#8B8D98', marginBottom: 32, textAlign: 'center' },
  input: { backgroundColor: '#1A1D24', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16, color: '#fff' },
  button: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#4CAF50', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
