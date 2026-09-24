import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loadPrivateKey, loadAddress, deleteWallet } from '../services/wallet';
import { useNavigation } from '@react-navigation/native';

export default function BackupScreen() {
  const [privKey, setPrivKey] = useState('');
  const [address, setAddress] = useState('');
  const [show, setShow] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadPrivateKey().then(setPrivKey);
    loadAddress().then(setAddress);
  }, []);

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet?',
      'Your private key will be erased. Make sure you have backed it up. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWallet();
            navigation.reset({ index: 0, routes: [{ name: 'CreateWallet' }] });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup Wallet</Text>
      <Text style={styles.warning}>⚠ Write down your private key. Anyone with it can access your funds.</Text>

      <Text style={styles.label}>Address</Text>
      <Text style={styles.value} selectable>{address}</Text>

      <Text style={styles.label}>Private Key</Text>
      {show ? (
        <Text style={styles.privKey} selectable>{privKey}</Text>
      ) : (
        <TouchableOpacity style={styles.revealBtn} onPress={() => setShow(true)}>
          <Text style={styles.revealText}>Tap to reveal private key</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.doneBtn} onPress={() => Alert.alert('Done', 'Keep your private key safe')}>
        <Text style={styles.doneText}>I've saved it</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 60, marginBottom: 16 },
  warning: { color: '#FF9800', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 8, marginTop: 16 },
  value: { color: '#4CAF50', fontSize: 13, fontFamily: 'monospace' },
  privKey: { color: '#FF5252', fontSize: 13, fontFamily: 'monospace', backgroundColor: '#1A1D24', padding: 16, borderRadius: 8 },
  revealBtn: { backgroundColor: '#1A1D24', padding: 16, borderRadius: 8, alignItems: 'center' },
  revealText: { color: '#8B8D98', fontSize: 14 },
  doneBtn: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#1A1D24', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#FF5252' },
  deleteText: { color: '#FF5252', fontSize: 14, fontWeight: '600' },
});
