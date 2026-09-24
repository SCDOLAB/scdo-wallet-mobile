import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function SendScreen() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send SCDO</Text>
      <Text style={styles.subtitle}>Enter recipient address and amount</Text>

      <Text style={styles.label}>Recipient Address</Text>
      <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="1S..." placeholderTextColor="#555" />

      <Text style={styles.label}>Amount (SCDO)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#555" />

      <TouchableOpacity style={styles.sendBtn} onPress={() => Alert.alert('Coming Soon', 'Transaction signing in progress')}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 8 },
  subtitle: { color: '#8B8D98', fontSize: 14, marginBottom: 32 },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1A1D24', borderRadius: 10, padding: 16, color: '#fff', fontSize: 16 },
  sendBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
