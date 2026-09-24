import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { loadAddress } from '../services/wallet';

export default function ReceiveScreen() {
  const [address, setAddress] = useState('');
  useEffect(() => { loadAddress().then(setAddress); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive SCDO</Text>
      <Text style={styles.subtitle}>Scan or share your address</Text>
      {address ? (
        <View style={styles.qrCard}>
          <QRCode value={address} size={200} backgroundColor="#fff" color="#000" />
          <Text style={styles.address} selectable>{address}</Text>
        </View>
      ) : (
        <Text style={styles.loading}>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 60, marginBottom: 8 },
  subtitle: { color: '#8B8D98', fontSize: 14, marginBottom: 32 },
  qrCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center' },
  address: { color: '#333', fontSize: 11, fontFamily: 'monospace', marginTop: 16, textAlign: 'center', maxWidth: 250 },
  loading: { color: '#8B8D98', marginTop: 60 },
});
