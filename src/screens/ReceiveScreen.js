import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { loadAddress } from '../services/wallet';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ReceiveScreen() {
  const [address, setAddress] = useState('');

  useFocusEffect(
    useCallback(() => { loadAddress().then(setAddress); }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive</Text>
      <Text style={styles.subtitle}>Scan QR or share your address</Text>
      {address ? (
        <View style={styles.qrCard}>
          <QRCode value={address} size={220} backgroundColor="#fff" color="#000" />
          <View style={styles.addrBox}>
            <Text style={styles.addrLabel}>Your SCDO Address</Text>
            <Text style={styles.address} selectable>{address}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loading}>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11', padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 60, marginBottom: 8 },
  subtitle: { color: '#8B8D98', fontSize: 14, marginBottom: 32 },
  qrCard: { backgroundColor: '#fff', padding: 24, borderRadius: 20, alignItems: 'center', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  addrBox: { marginTop: 20, alignItems: 'center', maxWidth: 260 },
  addrLabel: { color: '#999', fontSize: 11, marginBottom: 6 },
  address: { color: '#333', fontSize: 11, fontFamily: 'monospace', textAlign: 'center', lineHeight: 16 },
  loading: { color: '#8B8D98', marginTop: 60 },
});
