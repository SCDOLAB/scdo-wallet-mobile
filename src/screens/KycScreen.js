import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { saveKyc, loadKyc, loadKycContract } from '../services/kyc';

const CUSTOMER_TYPES = ['Individual', 'Sole Trader', 'Body Corporate', 'Partnership', 'Trust', 'Other'];

export default function KycScreen() {
  const [customerType, setCustomerType] = useState('Individual');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [abnAcn, setAbnAcn] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Australia');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idIssuedBy, setIdIssuedBy] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [sourceOfWealth, setSourceOfWealth] = useState('');
  const [expectedMonthlyAUD, setExpectedMonthlyAUD] = useState('');
  const [pep, setPep] = useState(false);
  const [sanctions, setSanctions] = useState(false);
  const [edRequired, setEdRequired] = useState(false);
  const [riskRating, setRiskRating] = useState('low');
  const [verified, setVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState('');
  const [onChainAddr, setOnChainAddr] = useState('');

  useEffect(() => { loadExisting(); }, []);

  async function loadExisting() {
    const d = await loadKyc();
    if (d) {
      setCustomerType(d.customerType || 'Individual');
      setFullName(d.fullName || '');
      setBusinessName(d.businessName || '');
      setAbnAcn(d.abnAcn || '');
      setDob(d.dob || '');
      setAddress(d.address || '');
      setCountry(d.country || 'Australia');
      setIdType(d.idType || '');
      setIdNumber(d.idNumber || '');
      setIdIssuedBy(d.idIssuedBy || '');
      setSourceOfFunds(d.sourceOfFunds || '');
      setSourceOfWealth(d.sourceOfWealth || '');
      setExpectedMonthlyAUD(d.expectedMonthlyAUD || '');
      setPep(d.pep || false);
      setSanctions(d.sanctions || false);
      setEdRequired(d.edRequired || false);
      setRiskRating(d.riskRating || 'low');
      setVerified(d.verified || false);
      setVerifiedAt(d.verifiedAt || '');
    }
    const c = await loadKycContract();
    if (c) setOnChainAddr(c.contractAddress || '');
  }

  async function handleSave() {
    if (!fullName || !idNumber) { Alert.alert('Error', 'Name and ID required'); return; }
    await saveKyc({
      customerType, fullName, businessName, abnAcn, dob, address, country,
      idType, idNumber, idIssuedBy, sourceOfFunds, sourceOfWealth,
      expectedMonthlyAUD, pep, sanctions, edRequired, riskRating,
      verified: true, verifiedAt: new Date().toISOString(),
    });
    Alert.alert('Saved', 'CDD record retained per AML/CTF Act');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>KYC / AML Compliance</Text>
      <Text style={styles.subtitle}>9Y9 Pty Ltd — AML/CTF Program</Text>

      <Text style={styles.section}>Customer Type</Text>
      <View style={styles.typeRow}>
        {CUSTOMER_TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.typeBtn, customerType === t && styles.typeActive]} onPress={() => setCustomerType(t)}>
            <Text style={[styles.typeText, customerType === t && { color: '#fff' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Identity</Text>
      <Text style={styles.label}>Full Legal Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#555" />
      {customerType !== 'Individual' && (
        <>
          <Text style={styles.label}>Business Name</Text>
          <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholderTextColor="#555" />
          <Text style={styles.label}>ABN / ACN</Text>
          <TextInput style={styles.input} value={abnAcn} onChangeText={setAbnAcn} placeholderTextColor="#555" />
        </>
      )}
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholderTextColor="#555" />
      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholderTextColor="#555" />

      <Text style={styles.section}>ID Verification</Text>
      <Text style={styles.label}>ID Type</Text>
      <TextInput style={styles.input} value={idType} onChangeText={setIdType} placeholderTextColor="#555" />
      <Text style={styles.label}>ID Number</Text>
      <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} placeholderTextColor="#555" />

      <Text style={styles.section}>Enhanced Due Diligence</Text>
      <Text style={styles.label}>Source of Funds</Text>
      <TextInput style={styles.input} value={sourceOfFunds} onChangeText={setSourceOfFunds} placeholderTextColor="#555" />
      <Text style={styles.label}>Source of Wealth</Text>
      <TextInput style={styles.input} value={sourceOfWealth} onChangeText={setSourceOfWealth} placeholderTextColor="#555" />
      <Text style={styles.label}>Expected Monthly Turnover (AUD)</Text>
      <TextInput style={styles.input} value={expectedMonthlyAUD} onChangeText={setExpectedMonthlyAUD} placeholderTextColor="#555" />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>PEP?</Text>
        <Switch value={pep} onValueChange={setPep} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Sanctions hit?</Text>
        <Switch value={sanctions} onValueChange={setSanctions} />
      </View>

      <Text style={styles.section}>Risk Rating</Text>
      <View style={styles.riskRow}>
        {['low', 'medium', 'high'].map(r => (
          <TouchableOpacity key={r} style={[styles.riskBtn, riskRating === r && styles.riskActive]} onPress={() => setRiskRating(r)}>
            <Text style={[styles.riskText, riskRating === r && { color: '#fff' }]}>{r.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={[styles.status, { color: verified ? '#4CAF50' : '#FF9800' }]}>{verified ? 'VERIFIED' : 'PENDING'}</Text>
      </View>
      {onChainAddr ? (
        <>
          <Text style={styles.section}>On-Chain Contract</Text>
          <Text style={styles.onchain} selectable>{onChainAddr}</Text>
        </>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save KYC</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 60, marginBottom: 4 },
  subtitle: { color: '#8B8D98', fontSize: 13, marginBottom: 16 },
  section: { color: '#4CAF50', fontSize: 14, fontWeight: '600', marginTop: 24, marginBottom: 10 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { padding: 8, borderWidth: 1, borderColor: '#333', borderRadius: 6 },
  typeActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  typeText: { color: '#8B8D98', fontSize: 12 },
  label: { color: '#8B8D98', fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1A1D24', borderRadius: 8, padding: 14, color: '#fff', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  switchLabel: { color: '#8B8D98', fontSize: 14, flex: 1 },
  riskRow: { flexDirection: 'row', gap: 10 },
  riskBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 8, alignItems: 'center' },
  riskActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  riskText: { color: '#8B8D98' },
  statusBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1D24', borderRadius: 10, marginTop: 24 },
  statusLabel: { color: '#8B8D98' },
  status: { fontWeight: '700' },
  onchain: { color: '#4CAF50', fontSize: 12, fontFamily: 'monospace', backgroundColor: '#1A1D24', padding: 12, borderRadius: 8 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
