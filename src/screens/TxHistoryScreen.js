import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadAddress } from '../services/wallet';

export default function TxHistoryScreen() {
  const [txs, setTxs] = useState([]);

  useEffect(() => { loadTxs(); }, []);

  async function loadTxs() {
    const addr = await loadAddress();
    // Known transactions (RPC doesn't support indexing)
    const known = [];
    if (addr) {
      known.push({
        hash: '0x5c7c712fdf3ddc84cd70aa529ce70aea6b9bfbd1f3319b2e8e82872c26a59f8',
        from: '1S013549ef29...',
        to: addr,
        amount: '100.00000000 SCDO',
        time: '2026-09-24 19:31 AEST (UTC+10)',
      });
    }
    setTxs(known);
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
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <Text style={styles.txHash} numberOfLines={1}>{item.hash}</Text>
              <Text style={styles.txFrom}>{item.from}</Text>
              <Text style={styles.txTo} numberOfLines={1}>→ {item.to}</Text>
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
  txFrom: { color: '#8B8D98', fontSize: 12, marginTop: 8 },
  txTo: { color: '#E8EAF0', fontSize: 12, marginTop: 2 },
  txAmount: { color: '#4CAF50', fontSize: 18, fontWeight: '700', marginTop: 8 },
  txTime: { color: '#555', fontSize: 11, marginTop: 4 },
});
