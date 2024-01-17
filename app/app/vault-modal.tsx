import { Link, router } from "expo-router";
import { View, Text, TextInput } from "react-native";
import { ActivityIndicator, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useContract,
  useContractRead,
  useContractWrite,
  useSDK,
} from "@thirdweb-dev/react-native";
import { useUserStore } from "../../store";
import {
  GHO_SEPOLIA_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "../../constants/sepolia";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import AppButton from "../../components/app-button";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PocketInfoModal() {
  const sdk = useSDK();
  const user = useUserStore((state) => state.user);
  const { contract: ghoContract } = useContract(GHO_SEPOLIA_ADDRESS);
  const { data: balanceData = BigNumber.from(0), isLoading: balanceOfLoading } =
    useContractRead(ghoContract, "balanceOf", [user?.address]);
  const balance = (balanceData / 10 ** 18).toFixed(2);
  const { contract: vaultContract } = useContract(VAULT_ADDRESS, VAULT_ABI);

  const { data: totalShares = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "totalAssets"
  );
  const { data: userShares = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "totalAssetsOfUser",
    [user?.address]
  );
  const { data: userBalance = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "convertUserSharesToAssets",
    [user?.address, userShares]
  );
  const { data: vaultBalance = BigNumber.from(0) } = useContractRead(
    ghoContract,
    "balanceOf",
    [VAULT_ADDRESS]
  );
  const { mutateAsync: approve, isLoading: isApproving } = useContractWrite(
    ghoContract,
    "approve"
  );
  const { data: approvalData } = useContractRead(ghoContract, "allowance", [
    user?.address,
    VAULT_ADDRESS,
  ]);
  const [depositAmount, setDepositAmount] = useState("0");
  const { mutateAsync: deposit, isLoading: isDepositing } = useContractWrite(
    vaultContract,
    "deposit"
  );
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const { mutateAsync: withdraw, isLoading: isWithdrawing } = useContractWrite(
    vaultContract,
    "withdraw"
  );

  const canDeposit =
    depositAmount &&
    parseFloat(depositAmount) > 0 &&
    balanceData.gte(BigNumber.from(depositAmount));
  const canWithdraw =
    withdrawAmount &&
    parseFloat(withdrawAmount) > 0 &&
    userBalance.gte(BigNumber.from(withdrawAmount));

  const executeDeposit = async () => {
    try {
      const depositAmountInWei = BigNumber.from(depositAmount).mul(
        BigNumber.from(10).pow(18)
      );

      if (approvalData.eq(0)) {
        console.log("approving spending");
        const { receipt } = await approve({
          args: [VAULT_ADDRESS, ethers.constants.MaxUint256],
        });
      }

      console.log(vaultContract?.abi);

      const { receipt } = await deposit({
        args: [depositAmountInWei, user?.address],
      });

      if (receipt) {
        setDepositAmount("");
      }
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Deposited GHO successfully.",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "Error depositing GHO. Try again.",
      });
    }
  };

  const executeWithdraw = async () => {
    try {
      const withdrawAmountInWei = BigNumber.from(withdrawAmount).mul(
        BigNumber.from(10).pow(18)
      );

      const { receipt } = await withdraw({
        args: [withdrawAmountInWei, user?.address, user?.address],
      });

      if (receipt) {
        setWithdrawAmount("");
      }
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Withdrawn GHO successfully.",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "Error withdrawing GHO. Try again.",
      });
    }
  };

  const isPresented = router.canGoBack();
  return (
    <SafeAreaView
      className="flex-1 flex-col bg-[#201F2D]"
      edges={{ top: "off" }}
    >
      {!isPresented && <Link href="../">Dismiss</Link>}
      <Appbar.Header
        elevated={false}
        statusBarHeight={0}
        className="bg-[#201F2D] text-white"
      >
        <Appbar.Content
          title="GHO Vault"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action
          icon={() => <Icon name="close" size={24} color="#FFF" />}
          onPress={() => {
            router.back();
          }}
          color="#fff"
          size={20}
        />
      </Appbar.Header>
      <View className="flex flex-col px-4 mt-2 bg-[#201F2D]">
        <View className="px-14 pb-8">
          <Text className="text-white font-semibold text-center mb-4">
            Vault balance
          </Text>
          <Text className="text-white font-bold text-center text-5xl">
            ${userBalance.div(BigNumber.from(10).pow(18)).toNumber().toFixed(2)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-around space-x-4">
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">APY</Text>
            <Text className="text-white text-2xl font-bold text-center">
              3%
            </Text>
          </View>
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">Your Shares</Text>
            <Text className="text-white text-2xl font-bold text-center">
              {userShares.gt(0)
                ? userShares
                    .div(totalShares)
                    .div(BigNumber.from(10).pow(18))
                    .toNumber()
                    .toFixed(2)
                : "0"}
              %
            </Text>
          </View>
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">Vault Balance</Text>
            <Text className="text-white text-2xl font-bold text-center">
              $
              {vaultBalance
                .div(BigNumber.from(10).pow(18))
                .toNumber()
                .toFixed(2)}
            </Text>
          </View>
        </View>
        <Text className="text-[#53516C] font-semibold mt-4">GHO Balance</Text>
        <Text className="text-white font-semibold mt-2 text-lg">
          {balance} GHO
        </Text>
        <Text className="text-[#53516C] font-semibold mt-4 mb-2">Deposit</Text>
        <Text className="text-white mb-2">
          This is the amount of GHO that you will deposit.
        </Text>
        <View className="mb-2 text-white border-2 border-[#C9B3F9] px-2 py-3 rounded-md flex flex-row items-center justify-between">
          <TextInput
            value={depositAmount}
            onChangeText={(value) => {
              if (isNaN(Number(value))) return setDepositAmount("");
              setDepositAmount(value);
            }}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            className="placeholder-white min-w-[300px]"
            keyboardType="numeric"
          />
          <Text className="text-white font-bold">GHO</Text>
        </View>
        <View className="mt-2">
          {isDepositing || isApproving ? (
            <ActivityIndicator animating={true} color={"#C9B3F9"} />
          ) : (
            <AppButton
              text="Deposit"
              onPress={() => executeDeposit()}
              variant={canDeposit ? "primary" : "disabled"}
            />
          )}
        </View>
        <Text className="text-[#53516C] font-semibold mt-4 mb-2">Withdraw</Text>
        <Text className="text-white mb-2">
          This is the amount of GHO that you will withdraw.
        </Text>
        <View className="mb-2 text-white border-2 border-[#C9B3F9] px-2 py-3 rounded-md flex flex-row items-center justify-between">
          <TextInput
            value={withdrawAmount}
            onChangeText={(value) => {
              if (isNaN(Number(value))) return setWithdrawAmount("");
              setWithdrawAmount(value);
            }}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            className="placeholder-white min-w-[300px]"
            keyboardType="numeric"
          />
          <Text className="text-white font-bold">GHO</Text>
        </View>
        <View className="mt-2">
          {isWithdrawing ? (
            <ActivityIndicator animating={true} color={"#C9B3F9"} />
          ) : (
            <AppButton
              text="Withdraw"
              onPress={() => executeWithdraw()}
              variant={canWithdraw ? "primary" : "disabled"}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
