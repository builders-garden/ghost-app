import { Pressable, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { ActivityIndicator, Appbar, Icon } from "react-native-paper";
import { Text } from "react-native";
import { useSendStore } from "../../store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  shortenAddress,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react-native";
import { GHO_SEPOLIA_ADDRESS } from "../../constants/sepolia";
import { BigNumber } from "ethers";
import AppButton from "../../components/app-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";
import { firebaseFirestore } from "../../firebaseConfig";

export default function SendModal() {
  const [copied, setCopied] = useState(false);
  const isPresented = router.canGoBack();
  const sendUser = useSendStore((state) => state.user);
  const setSendUser = useSendStore((state) => state.setSendUser);
  const { contract } = useContract(GHO_SEPOLIA_ADDRESS);
  const address = useAddress();
  const [amount, setAmount] = useState("0");
  const {
    data: balanceData,
    isLoading: balanceOfLoading,
    error,
  } = useContractRead(contract, "balanceOf", [address]);
  const {
    mutateAsync: transfer,
    isLoading: transferLoading,
    error: transferError,
  } = useContractWrite(contract, "transfer");
  const { data: decimalsData, isLoading: decimalsLoading } = useContractRead(
    contract,
    "decimals",
    []
  );
  const balance =
    balanceData && decimalsData
      ? (balanceData as BigNumber)
          .div(BigNumber.from(10).pow(decimalsData as number))
          .toNumber()
          .toFixed(2)
      : (0).toFixed(2);

  const canSend = Number(balance) > Number(amount) && parseFloat(amount) > 0;

  const sendTokens = async () => {
    if (transferLoading || !sendUser) return;
    const amountToTransfer = BigNumber.from(amount).mul(
      BigNumber.from(10).pow(decimalsData as number)
    );
    const { receipt } = await transfer({
      args: [sendUser!.address, amountToTransfer],
    });
    const transaction = {
      receipt,
      from: address,
      fromUsername: sendUser.username,
      to: sendUser.address,
      amount,
      createdAt: new Date().toISOString(),
    };
    await setDoc(
      doc(firebaseFirestore, "transactions", receipt.transactionHash),
      transaction
    );
  };

  if (!sendUser) {
    return <View className="flex-1 flex-col px-4 bg-[#201F2D]"></View>;
  }

  return (
    <View className="flex-1 flex-col px-4 bg-[#201F2D]">
      {!isPresented && <Link href="../">Dismiss</Link>}
      <Appbar.Header
        elevated={false}
        statusBarHeight={0}
        className="bg-[#201F2D] text-white"
      >
        <Appbar.Content
          title="Send GHO"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action
          icon={() => <Icon source="close" size={24} color="#FFF" />}
          onPress={() => {
            setSendUser(undefined);
            router.back();
          }}
          color="#fff"
          size={20}
        />
      </Appbar.Header>
      <Text className="text-[#53516C] font-semibold mt-8">
        Recipient address
      </Text>
      {/* <Text className="text-white font-semibold mt-2">{sendUser?.address}</Text> */}
      <View className="bg-[#292836] rounded-lg flex flex-row justify-between mt-4 px-4 py-2">
        <Text className="text-[#53516C] text-ellipsis">
          {shortenAddress(sendUser?.address, false)}
        </Text>
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(sendUser?.address!);
            setCopied(true);
          }}
        >
          <Icon
            source={!copied ? "clipboard" : "check"}
            size={16}
            color={!copied ? "#53516C" : "green"}
          />
        </Pressable>
      </View>
      <Text className="text-[#53516C] font-semibold mt-4">Balance</Text>
      {balanceOfLoading || decimalsLoading ? (
        <ActivityIndicator animating={true} color={"#C9B3F9"} />
      ) : (
        <Text className="text-white font-semibold mt-2 text-lg">
          ${balance} ({balance} GHO)
        </Text>
      )}
      <Text className="text-[#53516C] font-semibold mt-4 mb-2">Amount</Text>
      <Text className="text-white mb-2">
        This is the amount that you will send to the recipient.
      </Text>
      <View className="mb-2 text-white border-2 border-[#C9B3F9] px-2 py-3 rounded-md flex flex-row items-center justify-between">
        <TextInput
          value={amount}
          onChangeText={(value) => {
            if (isNaN(Number(value))) return setAmount("");
            setAmount(value);
          }}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          className="placeholder-white min-w-[300px]"
          keyboardType="numeric"
        />
        <Text className="text-white font-bold">GHO</Text>
      </View>
      {Number(amount) > Number(balance) && (
        <Text className="text-red-500 text-xs">Amount exceeds balance.</Text>
      )}
      {Number(amount) <= 0 && (
        <Text className="text-red-500 text-xs">Amount cannot be zero.</Text>
      )}
      <SafeAreaView className="mt-auto">
        <AppButton
          text="Send"
          onPress={() => sendTokens()}
          variant={canSend ? "primary" : "disabled"}
        />
      </SafeAreaView>
    </View>
  );
}
