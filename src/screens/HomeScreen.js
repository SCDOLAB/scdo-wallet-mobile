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
        <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
        <View style={styles.tabs}>
          <Text style={styles.tab}>托管钱包</Text>
          <View style={styles.tabActive}><Text style={styles.tabActiveText}>WEB3钱包</Text></View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Receive')}>
          <Text style={styles.scan}>⊞</Text>
        </TouchableOpacity>
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Send')}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionLabel}>发送</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Receive')}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionLabel}>接收</Text>
        </TouchableOpacity>
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>⇄</Text>
          <Text style={styles.actionLabel}>闪兑</Text>
        </View>
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionLabel}>信用卡</Text>
        </View>
      </View>

      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#666" />
      }>
        {/* Asset tabs */}
        <View style={styles.assetHeader}>
          <Text style={styles.assetTitle}>资产</Text>
          <Text style={styles.toolTag}>工具 NEW</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>搜索币种</Text>
        </View>

        {/* SCDO token row */}
        <View style={styles.tokenRow}>
          <View style={styles.tokenIcon}><Text style={styles.tokenIconText}>S</Text></View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>SCDO</Text>
            <Text style={styles.tokenUsd}>≈$0</Text>
          </View>
          <View style={styles.tokenRight}>
            <Text style={styles.tokenBalance}>{balance}</Text>
          </View>
        </View>

        {/* Other tokens placeholder */}
        {['USDO TEST', 'LSD', 'WIN'].map(t => (
          <View style={styles.tokenRow} key={t}>
            <View style={[styles.tokenIcon, { backgroundColor: '#1a1d24' }]}>
              <Text style={styles.tokenIconText}>{t[0]}</Text>
            </View>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{t}</Text>
              <Text style={styles.tokenUsd}>≈$0</Text>
            </View>
            <Text style={styles.tokenBalance}>0.00</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <Text style={[styles.navItem, styles.navActive]}>◈ 资产</Text>
        <Text style={styles.navItem}>⇄ 交易</Text>
        <Text style={styles.navItem}>◉ 赚币</Text>
        <TouchableOpacity onPress={() => navigation.navigate('KYC')}>
          <Text style={styles.navItem}>◇ KYC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1d24', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16 },
  tabs: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 20 },
  tab: { color: '#666', fontSize: 14 },
  tabActive: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4 },
  tabActiveText: { color: '#000', fontSize: 14, fontWeight: '600' },
  scan: { color: '#fff', fontSize: 22 },
  actionRow: { flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 8 },
  actionItem: { flex: 1, alignItems: 'center' },
  actionIcon: { color: '#fff', fontSize: 22, marginBottom: 6 },
  actionLabel: { color: '#aaa', fontSize: 12 },
  assetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  assetTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  toolTag: { color: '#4CAF50', fontSize: 11, backgroundColor: '#1a3a1a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1d24', margin: 16, borderRadius: 12, padding: 12 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchText: { color: '#555', fontSize: 14 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1d24' },
  tokenIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  tokenIconText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tokenInfo: { flex: 1, marginLeft: 12 },
  tokenName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  tokenUsd: { color: '#666', fontSize: 12, marginTop: 2 },
  tokenRight: { alignItems: 'flex-end' },
  tokenBalance: { color: '#fff', fontSize: 16, fontWeight: '500' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#1a1d24' },
  navItem: { color: '#666', fontSize: 13 },
  navActive: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
});
