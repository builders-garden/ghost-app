import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react-native";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { Appbar, ActivityIndicator } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth, firebaseFirestore } from "../firebaseConfig";
import AppButton from "../components/app-button";
import { router } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { useUserStore } from "../store";
import {
  AAVE_POOL_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
} from "../constants/sepolia";
import { ethers } from "ethers";
import Toast from "react-native-toast-message";

const generatePassword = () => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const passwordLength = 12;
  let password = "";
  for (let i = 0; i <= passwordLength; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [loading, setLoading] = useState(true);
  const address = useAddress();
  const setUser = useUserStore((state) => state.setUser);
  const { contract: usdcContract } = useContract(USDC_ADDRESS);
  const { mutateAsync: approveUSDC } = useContractWrite(
    usdcContract,
    "approve"
  );
  const { data: approvalData } = useContractRead(usdcContract, "allowance", [
    address,
    AAVE_POOL_ADDRESS,
  ]);
  const { contract: usdtContract } = useContract(USDT_ADDRESS);
  const { mutateAsync: approveUSDT } = useContractWrite(
    usdtContract,
    "approve"
  );
  const { data: approvalData2 } = useContractRead(usdtContract, "allowance", [
    address,
    AAVE_POOL_ADDRESS,
  ]);

  useEffect(() => {
    if (address && approvalData && approvalData2) {
      step === 0 && createAccount(address);
    }
  }, [step, address, approvalData, approvalData2]);

  const createAccount = async (address: string) => {
    let password = await SecureStore.getItemAsync(`password-${address}`);
    if (!password) {
      password = generatePassword();
    }
    await SecureStore.setItemAsync(`password-${address}`, password);

    if (!firebaseAuth.currentUser) {
      try {
        await createUserWithEmailAndPassword(
          firebaseAuth,
          `${address}@ghost.app`,
          password
        );
      } catch (error) {
        await signInWithEmailAndPassword(
          firebaseAuth,
          `${address}@ghost.app`,
          password
        );
      }
    }

    if (approvalData.eq(0)) {
      console.log("approving usdc");
      const { receipt: usdcReceipt } = await approveUSDC({
        args: [AAVE_POOL_ADDRESS, ethers.constants.MaxUint256],
      });
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Approved USDC spending.",
      });
      console.log("usdc approved");
    }

    if (approvalData2.eq(0)) {
      console.log("approving usdt");
      const { receipt: usdtReceipt } = await approveUSDT({
        args: [AAVE_POOL_ADDRESS, ethers.constants.MaxUint256],
      });
      console.log("usdt approved");
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Approved USDT spending.",
      });
    }

    setTimeout(() => {
      setStep(step + 1);
      setLoading(false);
    }, 1500);
  };

  const setFirebaseUsername = async () => {
    if (!address || loading) return;
    setLoading(true);
    try {
      const user = {
        address: address,
        username,
        rounding: isEnabled,
        createdAt: new Date().toISOString(),
        // smartWalletAddress: smartWalletAddresses![0],
      };
      await setDoc(
        doc(firebaseFirestore, "users", firebaseAuth.currentUser!.uid),
        user
      );
      setUser(user);
      setStep(step + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    await setFirebaseUsername();
    await SecureStore.setItemAsync(`onboarding-${address}`, "true");
    router.push("/app/home");
  };

  return (
    <View className="flex-1 ">
      <Appbar.Header className="bg-[#201F2D] text-white">
        <Appbar.Content
          title="Onboarding"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
      </Appbar.Header>
      {step === 0 && (
        <View className="flex-1 flex-col items-center justify-center space-y-2">
          <Text className="text-white font-semibold text-xl">
            Creating your account..
          </Text>
          <ActivityIndicator animating={loading} color={"#C9B3F9"} />
        </View>
      )}
      {step === 1 && (
        <View className="flex flex-col items-start px-4 justify-center space-y-2">
          {/* <Text className="text-white font-semibold text-xl">
            Choose your preferences
          </Text> */}
          <View className="w-full h-full">
            <Text className="text-[#C9B3F9] font-semibold my-2">Username</Text>
            <Text className="text-white mb-2">
              Other users will be able to find you via this handle.
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              className="mb-2 text-white border-2 border-[#C9B3F9] px-2 py-3 rounded-md placeholder-white"
            />
            <View className="flex flex-row justify-between mt-2 mb-4">
              <Text className="max-w-[300px] text-white">
                Set aside the remainder of each received transaction rounded to
                the nearest dollar (if you receive $1.30 set aside $0.30). This
                option is enabled by default.
              </Text>
              <Switch
                trackColor={{ false: "black", true: "#C9B3F9" }}
                thumbColor={"#201F2D"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                disabled
              />
            </View>
            <AppButton
              text="Complete onboarding"
              variant={username.length > 3 ? "primary" : "disabled"}
              onPress={() => finishOnboarding()}
            />
          </View>
        </View>
      )}
      {step === 2 && (
        <View className="flex-1 flex-col items-center justify-center space-y-2">
          <Text className="text-white font-semibold text-xl">
            Your account has been created!
          </Text>
          {/* <View className="w-full max-w-[300px]">
            <AppButton text="Enable notifications" onPress={() => {}} />
          </View> */}
          <View className="w-full max-w-[300px]">
            <AppButton
              text="Continue"
              variant="ghost"
              onPress={() => finishOnboarding()}
            />
          </View>
        </View>
      )}
    </View>
  );
}
