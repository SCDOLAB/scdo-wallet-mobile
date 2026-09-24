import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { rpc } from '../services/scdo';

export default function MineScreen() {
  const [blockHeight, setBlockHeight] = useState('—');
  const [mining, setMining] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStatus(); const t = setInterval(loadStatus, 10000); return () => clearInterval(t); }, []);

  async function loadStatus() {
    try {
      const h = await rpc(1, 'scdo_getBlockHeight');
      setBlockHeight(h);
    } catch (e) {}
  }

  function toggleMining() {
    setMining(!mining);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mining</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Node Status</Text>
        <Text style={styles.statusValue}>Online</Text>
        <Text style={styles.statusLabel}>Block Height</Text>
        <Text style={styles.statusValue}>{blockHeight}</Text>
      </View>

      <TouchableOpacity style={[styles.mineBtn, mining ? styles.mineOn : styles.mineOff]} onPress={toggleMining}>
        <Text style={styles.mineBtnText}>{mining ? 'Stop Mining' : 'Start Mining'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Remote mining mode: connects to your cloud node</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 24 },
  statusBox: { backgroundColor: '#1A1D24', borderRadius: 12, padding: 20, marginBottom: 24 },
  statusLabel: { color: '#666', fontSize: 12, marginTop: 12 },
  statusValue: { color: '#4CAF50', fontSize: 28, fontWeight: '700' },
  mineBtn: { borderRadius: 12, padding: 18, alignItems: 'center' },
  mineOn: { backgroundColor: '#FF5252' },
  mineOff: { backgroundColor: '#4CAF50' },
  mineBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
