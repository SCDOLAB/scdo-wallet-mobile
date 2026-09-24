import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { loadAddress } from '../services/wallet';

export default function KycScreen() {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { loadAddress().then(a => setAddress(a)); }, []);

  function submitKyc() {
    if (!name || !docNumber) { Alert.alert('Error', 'Fill in all fields'); return; }
    // TODO: write to on-chain KYC contract
    Alert.alert('KYC Submitted', 'Your KYC data will be stored on-chain.');
    setSubmitted(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Verification</Text>
      <Text style={styles.subtitle}>Stored on-chain under your address</Text>

      <View style={styles.addrBox}>
        <Text style={styles.addrLabel}>Wallet Address</Text>
        <Text style={styles.addrText} selectable>{address}</Text>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Smith" placeholderTextColor="#555" />

      <Text style={styles.label}>ID Type</Text>
      <TextInput style={styles.input} value={docType} onChangeText={setDocType} placeholder="Passport / Driver License" placeholderTextColor="#555" />

      <Text style={styles.label}>ID Number</Text>
      <TextInput style={styles.input} value={docNumber} onChangeText={setDocNumber} placeholder="ID number" placeholderTextColor="#555" />

      <TouchableOpacity style={styles.submitBtn} onPress={submitKyc}>
        <Text style={styles.submitText}>{submitted ? 'Update KYC' : 'Submit KYC'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Your KYC record will be stored in a smart contract tied to your address.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60 },
  subtitle: { color: '#666', fontSize: 14, marginTop: 4, marginBottom: 20 },
  addrBox: { backgroundColor: '#1A1D24', borderRadius: 10, padding: 14, marginBottom: 8 },
  addrLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  addrText: { color: '#4CAF50', fontSize: 12, fontFamily: 'monospace' },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1A1D24', borderRadius: 10, padding: 16, color: '#fff', fontSize: 16 },
  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
