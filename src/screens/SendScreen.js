import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPrivateKey, loadPublicKey, loadAddress } from '../services/wallet';
import { sendSCDO, sendToken } from '../services/transaction';
import { TOKENS } from '../services/scdo';

const TOKEN_OPTIONS = [
  { key: 'SCDO', label: 'SCDO', icon: 'S' },
  { key: 'AUDT', label: 'AUDt', icon: 'A' },
];

export default function SendScreen() {
  const [token, setToken] = useState('SCDO');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!to || !amount) { Alert.alert('Error', 'Enter address and amount'); return; }

    // Confirmation dialog
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${token}\nto ${to.slice(0, 12)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Send', onPress: doSend },
      ]
    );
  }

  async function doSend() {
    setSending(true);
    try {
      const privKey = await loadPrivateKey();
      const pubKey = await loadPublicKey();
      const from = await loadAddress();
      let txHash;
      if (token === 'SCDO') {
        txHash = await sendSCDO(privKey, pubKey, from, to, amount);
      } else {
        txHash = await sendToken(privKey, pubKey, from, to, amount, TOKENS.AUDT);
      }

      // Save to local history
      const txRecord = {
        hash: txHash || 'pending',
        from: from,
        to: to,
        amount: amount + ' ' + token,
        time: new Date().toLocaleString(),
      };
      const existing = await AsyncStorage.getItem('scdo_txs');
      const txs = existing ? JSON.parse(existing) : [];
      txs.unshift(txRecord);
      await AsyncStorage.setItem('scdo_txs', JSON.stringify(txs.slice(0, 50)));

      Alert.alert('Sent!', `Tx: ${txHash}\n\nTransaction saved to history.`);
      setTo('');
      setAmount('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send</Text>

      {/* Token selector */}
      <View style={styles.tokenRow}>
        {TOKEN_OPTIONS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tokenBtn, token === t.key && styles.tokenActive]} onPress={() => setToken(t.key)}>
            <Text style={[styles.tokenIcon, token === t.key && { color: '#fff' }]}>{t.icon}</Text>
            <Text style={[styles.tokenLabel, token === t.key && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Recipient Address</Text>
      <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="1S..." placeholderTextColor="#555" multiline />

      <Text style={styles.label}>Amount ({token})</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#555" />

      <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send {token}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 24 },
  tokenRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  tokenBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D24', borderRadius: 10, padding: 14, justifyContent: 'center' },
  tokenActive: { backgroundColor: '#4CAF50' },
  tokenIcon: { color: '#666', fontSize: 18, fontWeight: '700', marginRight: 8 },
  tokenLabel: { color: '#666', fontSize: 16, fontWeight: '600' },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1A1D24', borderRadius: 10, padding: 16, color: '#fff', fontSize: 16 },
  sendBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 32 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
