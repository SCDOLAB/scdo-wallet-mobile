import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { loadAddress } from '../services/wallet';
import { getBalance } from '../services/scdo';

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0.00000000');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadWallet(); }, []);

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
    } catch (e) { console.log(e); }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  }, [address]);

  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#666" />
    }>
      <View style={styles.header}>
        <Text style={styles.appName}>SCDO</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balance}>
          <Text style={styles.balanceSymbol}>$ </Text>{balance}
        </Text>
        <Text style={styles.balanceUnit}>SCDO</Text>
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>My Address</Text>
        <Text style={styles.address} selectable>{address}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Receive')}>
          <View style={[styles.actionIcon, { backgroundColor: '#1B5E20' }]}>
            <Text style={styles.actionIconText}>↓</Text>
          </View>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Send')}>
          <View style={[styles.actionIcon, { backgroundColor: '#B71C1C' }]}>
            <Text style={styles.actionIconText}>↑</Text>
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('KYC')}>
          <View style={[styles.actionIcon, { backgroundColor: '#0D47A1' }]}>
            <Text style={styles.actionIconText}>✓</Text>
          </View>
          <Text style={styles.actionText}>KYC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('TxHistory')}>
          <View style={[styles.actionIcon, { backgroundColor: '#4A148C' }]}>
            <Text style={styles.actionIconText}>≡</Text>
          </View>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  appName: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  balanceCard: { paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center' },
  balanceLabel: { color: '#8B8D98', fontSize: 13, marginBottom: 8 },
  balance: { color: '#fff', fontSize: 48, fontWeight: '300' },
  balanceSymbol: { color: '#8B8D98', fontSize: 24 },
  balanceUnit: { color: '#4CAF50', fontSize: 14, marginTop: 4, fontWeight: '600' },
  addressCard: { marginHorizontal: 16, backgroundColor: '#1A1D24', borderRadius: 12, padding: 16, marginBottom: 24 },
  addressLabel: { color: '#8B8D98', fontSize: 11, marginBottom: 6 },
  address: { color: '#E8EAF0', fontSize: 12, fontFamily: 'monospace' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 16 },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIconText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  actionText: { color: '#E8EAF0', fontSize: 13 },
});
