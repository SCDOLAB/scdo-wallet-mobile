import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import KycScreen from './src/screens/KycScreen';
import TxHistoryScreen from './src/screens/TxHistoryScreen';
import { hasWallet } from './src/services/wallet';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [walletReady, setWalletReady] = useState(false);

  useEffect(() => {
    checkWallet();
  }, []);

  async function checkWallet() {
    const exists = await hasWallet();
    setWalletReady(exists);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1115' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={walletReady ? 'Home' : 'CreateWallet'}
        screenOptions={{
          headerStyle: { backgroundColor: '#0F1115' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} options={{ title: 'Create Wallet' }} />
        <Stack.Screen name="ImportWallet" component={ImportWalletScreen} options={{ title: 'Import Wallet' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SCDO Wallet' }} />
        <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send' }} />
        <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive' }} />
        <Stack.Screen name="KYC" component={KycScreen} options={{ title: 'KYC Verification' }} />
        <Stack.Screen name="TxHistory" component={TxHistoryScreen} options={{ title: 'History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
