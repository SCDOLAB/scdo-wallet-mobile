import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { loadPrivateKey, loadAddress } from '../services/wallet';
import { signAndSend } from '../services/transaction';

export default function SendScreen() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [scanning, setScanning] = useState(false);
  const [sending, setSending] = useState(false);

  async function startScan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') setScanning(true);
  }

  function onBarcodeScanned({ data }) {
    setTo(data);
    setScanning(false);
  }

  async function handleSend() {
    if (!to || !amount) { Alert.alert('Error', 'Enter address and amount'); return; }
    setSending(true);
    try {
      const privKey = await loadPrivateKey();
      const from = await loadAddress();
      const txHash = await signAndSend(privKey, from, to, amount);
      Alert.alert('Sent!', `Tx: ${txHash}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  }

  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} onBarcodeScanned={onBarcodeScanned} barcodeSettings={{ codeTypes: ['qr'] }} />
        <TouchableOpacity style={styles.closeScan} onPress={() => setScanning(false)}>
          <Text style={styles.closeText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send SCDO</Text>

      <Text style={styles.label}>Recipient Address</Text>
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={to} onChangeText={setTo} placeholder="1S..." placeholderTextColor="#555" />
        <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
          <Text style={styles.scanIcon}>⊞</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount (SCDO)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#555" />

      <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 32 },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8, marginTop: 16 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: '#1A1D24', borderRadius: 10, padding: 16, color: '#fff', fontSize: 16 },
  scanBtn: { backgroundColor: '#1A1D24', borderRadius: 10, width: 52, alignItems: 'center', justifyContent: 'center' },
  scanIcon: { color: '#4CAF50', fontSize: 24 },
  sendBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeScan: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#333', padding: 14, borderRadius: 10 },
  closeText: { color: '#fff', fontSize: 16 },
});
