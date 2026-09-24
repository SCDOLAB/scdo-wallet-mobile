import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadAddress } from '../services/wallet';
import { getTransactions } from '../services/scdo';

export default function TxHistoryScreen() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTxs(); }, []);

  async function loadTxs() {
    const addr = await loadAddress();
    if (!addr) { setLoading(false); return; }
    try {
      const list = await getTransactions(addr);
      setTxs(list || []);
    } catch (e) {
      console.log('Tx history error:', e.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : txs.length === 0 ? (
        <Text style={styles.empty}>No transactions yet</Text>
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(item, i) => (item.hash || i).toString()}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <Text style={styles.txHash} numberOfLines={1}>{item.hash || 'tx'}</Text>
              <Text style={styles.txFrom} numberOfLines={1}>From: {item.from || '—'}</Text>
              <Text style={styles.txTo} numberOfLines={1}>To: {item.to || '—'}</Text>
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
  txItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1A1D24' },
  txHash: { color: '#4CAF50', fontSize: 12, fontFamily: 'monospace' },
  txFrom: { color: '#8B8D98', fontSize: 12, marginTop: 6 },
  txTo: { color: '#E8EAF0', fontSize: 12, marginTop: 2 },
});
