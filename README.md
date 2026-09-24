# SCDO Mobile Wallet

React Native (Expo) wallet for SCDO blockchain.

## Setup

1. Install Node.js 18+ (current machine has v10, needs upgrade)
2. Install dependencies:
```bash
cd scdo-wallet-mobile
npm install
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Features (v1)
- Create new wallet
- Import wallet via private key
- View balance (4 shards)
- Send SCDO
- Receive SCDO (address + QR)
- Secure private key storage (Keychain/Keystore)

## Network
- Shard 1: http://74.208.207.184:8037
- Shard 2: http://74.208.207.184:8038
- Shard 3: http://74.208.207.184:8039
- Shard 4: http://74.208.207.184:8036

## Next steps
- Add QR code scanning
- Add transaction history
- Add price/USD conversion
- TestFlight / Google Play internal testing
