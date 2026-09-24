import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { loadPrivateKey, getAddressFromPublicKey } from '../services/wallet';

export default function ReceiveScreen() {
  const [address, setAddress] = useState('');

  useEffect(() => { loadAddr(); }, []);

  async function loadAddr() {
    // TODO: derive address from stored private key
    // For now placeholder
    setAddress('1S012134572b51efcce9e4696d18a04c9b9b8b0af1');
  }

  async function shareAddress() {
    await Share.share({ message: `My SCDO address: ${address}` });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive SCDO</Text>
      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrText}>QR Code</Text>
        <Text style={styles.qrSub}>(Add QR library later)</Text>
      </View>
      <Text style={styles.addressLabel}>Your Address</Text>
      <Text style={styles.address} selectable>{address}</Text>
      <TouchableOpacity style={styles.button} onPress={shareAddress}>
        <Text style={styles.buttonText}>Share Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
  qrPlaceholder: { width: 200, height: 200, borderWidth: 2, borderColor: '#ddd', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  qrText: { fontSize: 18, color: '#999' },
  qrSub: { fontSize: 12, color: '#ccc' },
  addressLabel: { fontSize: 14, color: '#666', marginTop: 20 },
  address: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginVertical: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  button: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, width: '100%' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
