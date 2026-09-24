import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshView } from 'react-native';
import { loadPrivateKey, getAddressFromPublicKey } from '../services/wallet';
import { getBalance } from '../services/scdo';

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadWallet(); }, []);

  async function loadWallet() {
    const privKey = await loadPrivateKey();
    if (!privKey) return;
    // Derive public key from private key would need scdo.js
    // For now, we'll need to store the address
    // TODO: store address during creation
    setLoading(true);
    try {
      // This will be replaced with actual address from storage
      const Scdo = require('scdo.js');
      const client = new Scdo();
      // Use private key to derive address
      // For now placeholder
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  async function refreshBalance() {
    if (!address) return;
    try {
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.balance}>{balance} SCDO</Text>
        <Text style={styles.address} numberOfLines={1}>{address}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.sendBtn]} onPress={() => navigation.navigate('Send')}>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.receiveBtn]} onPress={() => navigation.navigate('Receive')}>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={refreshBalance}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  balanceCard: { backgroundColor: '#E94D5F', padding: 30, borderRadius: 16, margin: 16, alignItems: 'center' },
  label: { color: '#fff', fontSize: 14, opacity: 0.8 },
  balance: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  address: { color: '#fff', fontSize: 12, opacity: 0.7 },
  buttonRow: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  sendBtn: { backgroundColor: '#E94D5F' },
  receiveBtn: { backgroundColor: '#2196F3' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  refreshBtn: { padding: 12, alignItems: 'center' },
  refreshText: { color: '#666', fontSize: 14 },
});
