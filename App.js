import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E94D5F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!walletReady ? (
          <>
            <Stack.Screen name="CreateWallet" component={CreateWalletScreen} options={{ title: 'Create Wallet' }} />
            <Stack.Screen name="ImportWallet" component={ImportWalletScreen} options={{ title: 'Import Wallet' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SCDO Wallet' }} />
            <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send' }} />
            <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
