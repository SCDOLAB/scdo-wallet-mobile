import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { loadAddress } from '../services/wallet';
import { getBalance } from '../services/scdo';

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const addr = await loadAddress();
    if (addr) {
      setAddress(addr);
      refreshBalance(addr);
    }
  }

  async function refreshBalance(addr) {
    const target = addr || address;
    if (!target) return;
    try {
      const bal = await getBalance(target);
      setBalance(bal);
    } catch (e) {
      console.log('Balance error:', e.message);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  }, [address]);

  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
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
});
