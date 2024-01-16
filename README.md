# GHOst Wallet

<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center">
  <img src="./images/ghost.png" width="200" height="200" />
  <p>
    <b>GHOst</b> is a native wallet for managing your GHO tokens.
  </p>
</div>

## 👻 LFGHO Hackathon

This project was built during the [ETHGlobal LFGHO Hackathon](https://ethglobal.com/events/lfgho).

### 💰 Tracks

We are applying for the following tracks:

- **AAVE Payments**: we developed a native wallet that leverages AA (ERC-4337) to simplify the experience of sending, receiving and borrowing GHO tokens;
- **AAVE Vaults**: we developed an ERC-4626 GHO Vault that allows users to deposit GHO tokens and use them as liquidity provider into a GHO/USDC Uniswap pool. This vault is also auto-populated when users receive GHO tokens and all the GHOst users share the same vault contract. Also, any remainder of USDT or USDC tokens received by the user is automatically sent to AAVE Lending Contracts;
- **AAVE Integration Prize**: for allowing users to manage GHO tokens seamlessly by using their email address or Google account.

## ⚒️ GHOst Features

GHOst is the first GHO native wallet; this means that everything is built around GHO tokens: transfers, deposits, withdrawals, borrows. It allows users to create a new Smart Wallet by using their email address or Google account. Once the account is created, a custom Smart Account contract is created in order to automatically swap between received USDT or USDC tokens into GHO.

All the transactions are made leveraging the ERC-4337 Account Abstraction standard using the Thirdweb paymaster: **no fees or signing allowed in GHOst**.

Every time a user receives USDT, USDC or GHO, the remainder rounded to nearest dollar (eg. you receive $1.30, $0.30 will be set aside) is sent to:

- **AAVE Lending Contracts** in the case of **USDT** or **USDC**. The rest (eg. $1) is automatically swapped to GHO (on Sepolia using a Mock Uniswap Router) and sent to the user's Smart Account. Here these tokens maybe used by the user in the future to borrow some GHO, or they can leave them there to accrue some interest;
- **GHO Vault** in the case of GHO. The rest (eg. $1) is sent to the user's Smart Account. The tokens inside the GHO Vault are then used as liquidity provider into a GHO/USDC Uniswap pool.

## 📱 App features

GHOst wallet allows users to:

- [x] Create a Smart Wallet using their email address or Google account that can be exported to any Ethereum wallet via the private key;
- [x] Seamlessly transfer GHO tokens to other users using their GHOst username;
- [x] View their total **Pocket** balance (GHO Vault Balance + AAVE Lending Balance);
- [x] Deposit or withdraw GHO tokens from the GHO Vault;
- [x] Borrow or repay GHO tokens from the AAVE Protocol.

## 💻 Tech Stack

GHOst is built using Expo and React Native, leveraging Thirdweb React Native SDK for the wallet connection and other ethers polyfills.

### 📦 Run locally

In order to run the app locally, you need to execute the following steps:

```bash
# Install dependencies
npx expo install
```

Once the dependencies are installed, you **must** install the Expo modules and prebuild the app:

```bash
# Install Expo modules
npx install-expo-modules@latest
# Prebuild the app
npx expo prebuild
```

We need to prebuild the app because the Thirdweb SDK uses the Coinbase Wallet SDK that needs the app to be prebuilt in order to work.

Once the app is prebuilt, you can run it locally:

```bash
# iOS
yarn ios
# Android
yarn android
```

You need an iOS or Android simulator running in order to run the app. The app **DOES NOT WORK** on Expo Go for the reasons described above.
