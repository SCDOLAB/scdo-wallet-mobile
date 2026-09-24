import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loadAddress } from '../services/wallet';

export default function ReceiveScreen() {
  const [address, setAddress] = useState('');
  React.useEffect(() => { loadAddress().then(setAddress); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive SCDO</Text>
      <Text style={styles.subtitle}>Share your address to receive funds</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Your Address</Text>
        <Text style={styles.address} selectable>{address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 8 },
  subtitle: { color: '#8B8D98', fontSize: 14, marginBottom: 32 },
  card: { backgroundColor: '#1A1D24', borderRadius: 12, padding: 20 },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8 },
  address: { color: '#4CAF50', fontSize: 14, fontFamily: 'monospace', lineHeight: 22 },
});
