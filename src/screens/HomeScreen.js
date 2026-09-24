import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadAddress, loadPublicKey } from '../services/wallet';
import { getBalance, getTokenBalance, TOKENS } from '../services/scdo';

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0.00000000');
  const [audtBalance, setAudtBalance] = useState('0.00');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [])
  );

  async function loadWallet() {
    const addr = await loadAddress();
    const pubKey = await loadPublicKey();
    if (addr) { setAddress(addr); refreshBalance(pubKey, addr); }
  }

  async function refreshBalance(pubKey, addr) {
    const target = addr || address;
    const pk = pubKey || await loadPublicKey();
    if (!target) return;
    try {
      setBalance(await getBalance(pk, target));
      const audt = await getTokenBalance(TOKENS.AUDT, target);
      setAudtBalance(audt.toFixed(2));
    } catch (e) { console.log('balance error', e); }
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
        {/* SCDO row */}
        <View style={styles.assetRow}>
          <View style={styles.coinIcon}><Text style={styles.coinIconText}>S</Text></View>
          <View style={{flex:1}}>
            <Text style={styles.coinName}>SCDO</Text>
            <Text style={styles.coinSub}>Native Chain</Text>
          </View>
          <Text style={styles.coinBalance}>{balance}</Text>
        </View>

        {/* AUD Stablecoin row */}
        <View style={styles.assetRow}>
          <View style={[styles.coinIcon, { backgroundColor: '#1e6b3a' }]}><Text style={styles.coinIconText}>A</Text></View>
          <View style={{flex:1}}>
            <Text style={styles.coinName}>AUDt</Text>
            <Text style={styles.coinSub}>AUD Stablecoin</Text>
          </View>
          <Text style={styles.coinBalance}>{audtBalance}</Text>
        </View>

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
          <Text style={styles.navItem}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Mine')}>
          <Text style={styles.navItem}>挖矿</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Backup')}>
          <Text style={styles.navItem}>备份</Text>
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
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1d24' },
  coinIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  coinIconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  coinName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  coinSub: { color: '#666', fontSize: 11, marginTop: 2 },
  coinBalance: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fiatRow: { flexDirection: 'row', gap: 12, padding: 20 },
  depositBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 10, padding: 14, alignItems: 'center' },
  withdrawBtn: { flex: 1, backgroundColor: '#2a3142', borderRadius: 10, padding: 14, alignItems: 'center' },
  fiatBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1a1d24' },
  navItem: { color: '#666', fontSize: 14 },
  navActive: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
});
