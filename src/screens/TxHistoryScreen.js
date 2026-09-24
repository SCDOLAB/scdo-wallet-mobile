import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { loadTxHistory } from '../services/kyc';

export default function TxHistoryScreen() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    loadTxs();
  }, []);

  async function loadTxs() {
    const history = await loadTxHistory();
    setTxs(history);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      {txs.length === 0 ? (
        <Text style={styles.empty}>No transactions yet</Text>
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <Text style={styles.txTo}>To: {item.to}</Text>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  txItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  txTo: { fontSize: 14, color: '#333' },
  txAmount: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  txTime: { fontSize: 12, color: '#999', marginTop: 4 },
});
