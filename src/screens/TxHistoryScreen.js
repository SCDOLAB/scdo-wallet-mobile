import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadTxHistory } from '../services/kyc';

export default function TxHistoryScreen() {
  const [txs, setTxs] = useState([]);

  useEffect(() => { loadTxs(); }, []);

  async function loadTxs() {
    const history = await loadTxHistory();
    setTxs(history);
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
              <Text style={styles.txTo} numberOfLines={1}>To: {item.to}</Text>
              <Text style={styles.txAmount}>{item.amount} SCDO</Text>
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
  txItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1A1D24' },
  txTo: { color: '#8B8D98', fontSize: 13 },
  txAmount: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 4 },
  txTime: { color: '#555', fontSize: 11, marginTop: 4 },
});
