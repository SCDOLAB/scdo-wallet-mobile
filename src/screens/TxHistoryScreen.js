import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function TxHistoryScreen() {
  const [txs, setTxs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { loadTxs(); }, [])
  );

  async function loadTxs() {
    const existing = await AsyncStorage.getItem('scdo_txs');
    setTxs(existing ? JSON.parse(existing) : []);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadTxs();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      {txs.length === 0 ? (
        <Text style={styles.empty}>No transactions yet</Text>
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(item, i) => i.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <Text style={styles.txHash} numberOfLines={1}>{item.hash}</Text>
              <Text style={styles.txLabel}>To</Text>
              <Text style={styles.txTo} numberOfLines={1}>{item.to}</Text>
              <Text style={styles.txAmount}>{item.amount}</Text>
              <Text style={styles.txTime}>{item.time}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0F1115' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 60, marginBottom: 20 },
  empty: { color: '#8B8D98', fontSize: 15, textAlign: 'center', marginTop: 60 },
  txItem: { padding: 16, backgroundColor: '#1A1D24', borderRadius: 10, marginBottom: 12 },
  txHash: { color: '#4CAF50', fontSize: 11, fontFamily: 'monospace' },
  txLabel: { color: '#555', fontSize: 11, marginTop: 8 },
  txTo: { color: '#E8EAF0', fontSize: 12, marginTop: 2 },
  txAmount: { color: '#4CAF50', fontSize: 18, fontWeight: '700', marginTop: 8 },
  txTime: { color: '#555', fontSize: 11, marginTop: 4 },
});
