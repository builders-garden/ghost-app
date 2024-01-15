import { Pressable, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { ActivityIndicator, Appbar, Icon } from "react-native-paper";
import { Text } from "react-native";
import { useSendStore, useUserStore } from "../../store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  Web3Button,
  shortenAddress,
  useContract,
  useContractRead,
  useSDK,
  useTransferToken,
} from "@thirdweb-dev/react-native";
import { GHO_SEPOLIA_ADDRESS } from "../../constants/sepolia";
import { BigNumber } from "ethers";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";
import { firebaseFirestore } from "../../firebaseConfig";

export default function SendModal() {
  const [copied, setCopied] = useState(false);
  const isPresented = router.canGoBack();
  const sendUser = useSendStore((state) => state.user);
  const setSendUser = useSendStore((state) => state.setSendUser);
  const { contract } = useContract(GHO_SEPOLIA_ADDRESS);
  const { mutateAsync: transfer, isLoading: transferLoading } =
    useTransferToken(contract);
  const user = useUserStore((state) => state.user);
  const sdk = useSDK();
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const {
    data: balanceData,
    isLoading: balanceOfLoading,
    error,
  } = useContractRead(contract, "balanceOf", [user?.smartWalletAddress]);
  const balance = balanceData
    ? (balanceData as BigNumber)
        .div(BigNumber.from(10).pow(18))
        .toNumber()
        .toFixed(2)
    : (0).toFixed(2);

  const canSend = Number(balance) > Number(amount) && parseFloat(amount) > 0;

  const sendTokens = async () => {
    if (transferLoading || loading || !sendUser) return;
    setLoading(true);
    try {
      const amountToTransfer = BigNumber.from(amount).mul(
        BigNumber.from(10).pow(18)
      );
      console.log(user, [sendUser!.smartWalletAddress, amountToTransfer]);
      const { receipt } = await transfer(
        {
          to: sendUser!.smartWalletAddress,
          amount: amount,
        },
        {
          onError: (error) => {
            console.error(error);
          },
        }
      );
      const transaction = {
        receipt,
        from: user?.smartWalletAddress,
        fromUsername: sendUser.username,
        to: sendUser.smartWalletAddress,
        amount,
        createdAt: new Date().toISOString(),
      };
      await setDoc(
        doc(firebaseFirestore, "transactions", receipt.transactionHash),
        transaction
      );
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          {shortenAddress(sendUser?.smartWalletAddress, false)}
        </Text>
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(sendUser?.smartWalletAddress);
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
      {balanceOfLoading ? (
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
        {transferLoading || loading ? (
          <ActivityIndicator animating={true} color={"#C9B3F9"} />
        ) : (
          // <AppButton
          //   text="Send"
          //   onPress={() => sendTokens()}
          //   variant={canSend ? "primary" : "disabled"}
          // />
          <Web3Button
            contractAddress={GHO_SEPOLIA_ADDRESS}
            action={(contract) =>
              contract.erc20.transfer(sendUser!.smartWalletAddress, amount)
            }
          >
            Send
          </Web3Button>
        )}
      </SafeAreaView>
    </View>
  );
}
