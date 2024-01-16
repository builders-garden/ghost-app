import { Pressable, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { ActivityIndicator, Appbar, Icon } from "react-native-paper";
import { Text } from "react-native";
import { useSendStore, useUserStore } from "../../store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  Box,
  shortenAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useTransferToken,
} from "@thirdweb-dev/react-native";
import {
  AAVE_BORROW_ADDRESS,
  GHO_ASSET_PRICE,
  GHO_SEPOLIA_ADDRESS,
} from "../../constants/sepolia";
import { BigNumber } from "ethers";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";
import { firebaseFirestore } from "../../firebaseConfig";
import AppButton from "../../components/app-button";
import { formatUnits } from "ethers/lib/utils";
import Toast from "react-native-toast-message";
import { AmountChooser } from "../../components/amount-chooser";
import Avatar from "../../components/avatar";
import { InfoBox } from "../../components/infobox";
import Spacer from "../../components/spacer";

export default function SendModal() {
  const [copied, setCopied] = useState(false);
  const isPresented = router.canGoBack();
  const sendUser = useSendStore((state) => state.user);
  const setSendUser = useSendStore((state) => state.setSendUser);
  const user = useUserStore((state) => state.user);
  const { contract } = useContract(GHO_SEPOLIA_ADDRESS);
  const { mutateAsync: transfer, isLoading: transferLoading } =
    useTransferToken(contract);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: balanceData, isLoading: balanceOfLoading } = useContractRead(
    contract,
    "balanceOf",
    [user?.address]
  );
  const balance = balanceData
    ? (balanceData as BigNumber)
        .div(BigNumber.from(10).pow(18))
        .toNumber()
        .toFixed(2)
    : (0).toFixed(2);
  const { contract: aaveBorrowContract } = useContract(AAVE_BORROW_ADDRESS);
  const { data: userData, isLoading } = useContractRead(
    aaveBorrowContract,
    "getUserAccountData",
    [user?.address]
    // ["0x0e07Ed3049FD6408AEB26049e76609e0491b3A49"]
  );
  const { mutateAsync: borrow, isLoading: borrowLoading } = useContractWrite(
    aaveBorrowContract,
    "borrow"
  );

  const canBorrow =
    userData && userData[2]
      ? parseFloat(userData[2].div(GHO_ASSET_PRICE).toString()) > 0
      : false;
  const needToBorrow = Number(balance) < Number(amount);
  const canSend = Number(amount) <= Number(balance) && Number(amount) > 0;

  const sendTokens = async () => {
    if (transferLoading || loading || !sendUser) return;
    setLoading(true);
    try {
      if (needToBorrow && canBorrow) {
        await borrow({
          args: [
            GHO_SEPOLIA_ADDRESS,
            formatUnits(amount, 18),
            2,
            0,
            user?.address,
          ],
        });
      }
      const { receipt } = await transfer({
        to: sendUser!.address,
        amount,
      });
      const transaction = {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        from: user?.address,
        fromUsername: user?.username,
        to: sendUser.address,
        toUsername: sendUser?.username,
        amount,
        createdAt: new Date().toISOString(),
      };
      await setDoc(
        doc(firebaseFirestore, "transactions", receipt.transactionHash),
        transaction
      );
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "GHO sent successfully.",
      });
      router.back();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "An error has occurred. Try again.",
      });
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
      <View className="flex flex-col items-center mt-4 space-y-2">
        <Avatar name={sendUser?.username.charAt(0).toUpperCase()} />
        <Text className="text-white text-lg text-center font-semibold">
          {sendUser?.username}
        </Text>
        <Text className="text-gray-600 text-ellipsis">
          {shortenAddress(sendUser?.address, false)}
        </Text>

        <AmountChooser
          dollars={amount}
          onSetDollars={setAmount}
          showAmountAvailable
          autoFocus
          lagAutoFocus={false}
        />
        {balanceOfLoading ? (
          <ActivityIndicator animating={true} color={"#C9B3F9"} />
        ) : (
          <Text className="text-gray-600 font-semibold">
            ${balance} available
          </Text>
        )}
        {needToBorrow && (
          <>
            <Spacer h={16} />
            {canBorrow && (
              <InfoBox
                title="Insufficient balance, but..."
                subtitle={`You can still borrow ${
                  Number(amount) - Number(balance)
                } GHO and proceed with the transaction.`}
                variant="info"
              ></InfoBox>
            )}
            {!canBorrow && (
              <InfoBox
                title="Insufficient balance, and..."
                subtitle={`You don't have enough collateral to borrow ${
                  Number(amount) - Number(balance)
                } GHO and proceed with the transaction.`}
                variant="warning"
              ></InfoBox>
            )}
          </>
        )}
      </View>
      <SafeAreaView className="mt-auto">
        {transferLoading || loading ? (
          <ActivityIndicator animating={true} color={"#C9B3F9"} />
        ) : (
          <View className="flex flex-row justify-between">
            <View className="flex-1 mx-2">
              <AppButton
                text="Cancel"
                onPress={() => {
                  router.back();
                }}
                variant="ghost"
              />
            </View>
            <View className="flex-1 mx-2">
              <AppButton
                text={"Send"}
                onPress={() => sendTokens()}
                variant={canSend || canBorrow ? "primary" : "disabled"}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
