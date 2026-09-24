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
      await saveWallet(wallet.privateKey, wallet.address);
      Alert.alert('Success', `Wallet created!\nAddress: ${wallet.address}\n\nIMPORTANT: Back up your private key!`, [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Wallet</Text>
      <Text style={styles.subtitle}>Set a 6-digit PIN to secure your wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        secureTextEntry
        keyboardType="numeric"
        value={confirmPin}
        onChangeText={setConfirmPin}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Wallet'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ImportWallet')}>
        <Text style={styles.link}>Already have a wallet? Import</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#E94D5F', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#E94D5F', textAlign: 'center', marginTop: 16 },
});
