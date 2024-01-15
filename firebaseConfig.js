import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ghost-wallet-lfgho.firebaseapp.com",
  databaseURL: "https://ghost-wallet-lfgho.firebaseio.com",
  projectId: "ghost-wallet-lfgho",
  storageBucket: "ghost-wallet-lfgho.appspot.com",
  messagingSenderId: "sender-id",
  appId: "1:967514489377:ios:13214691ca54924d099960",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const firebaseFirestore = getFirestore(app);
