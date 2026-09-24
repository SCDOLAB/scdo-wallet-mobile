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
    if (addr) { setAddress(addr); refreshBalance(addr); }
  }

  async function refreshBalance(addr) {
    const target = addr || address;
    if (!target) return;
    try { setBalance(await getBalance(target)); } catch (e) {}
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await refreshBalance(); setRefreshing(false);
  }, [address]);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>SCDO Wallet</Text>
      </View>

      {/* Balance */}
      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>{balance}</Text>
        <Text style={styles.balanceUnit}>SCDO</Text>
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Send')}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Receive')}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Backup')}>
          <Text style={styles.actionIcon}>⬇</Text>
          <Text style={styles.actionLabel}>Backup</Text>
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#666" />
      }>
        {/* Address */}
        <View style={styles.addrBox}>
          <Text style={styles.addrLabel}>My Address</Text>
          <Text style={styles.addrText} selectable>{address}</Text>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <Text style={[styles.navItem, styles.navActive]}>资产</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TxHistory')}>
          <Text style={styles.navItem}>交易</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('KYC')}>
          <Text style={styles.navItem}>KYC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  topBar: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  balanceBox: { paddingHorizontal: 20, paddingVertical: 30, alignItems: 'center' },
  balanceLabel: { color: '#666', fontSize: 14, marginBottom: 8 },
  balanceValue: { color: '#fff', fontSize: 42, fontWeight: '700' },
  balanceUnit: { color: '#4CAF50', fontSize: 16, marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
  actionBtn: { alignItems: 'center' },
  actionIcon: { color: '#fff', fontSize: 28, marginBottom: 6 },
  actionLabel: { color: '#aaa', fontSize: 13 },
  addrBox: { margin: 20, padding: 16, backgroundColor: '#1a1d24', borderRadius: 12 },
  addrLabel: { color: '#666', fontSize: 12, marginBottom: 8 },
  addrText: { color: '#4CAF50', fontSize: 13, fontFamily: 'monospace' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1a1d24' },
  navItem: { color: '#666', fontSize: 14 },
  navActive: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
});
