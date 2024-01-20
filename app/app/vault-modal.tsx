import { Link, router } from "expo-router";
import { View, Text, TextInput } from "react-native";
import { ActivityIndicator, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slider } from "react-native-awesome-slider";
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
import { formatUnits } from "viem";
import { useSharedValue } from "react-native-reanimated";

export default function PocketInfoModal() {
  const sdk = useSDK();
  const user = useUserStore((state) => state.user);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const { contract: ghoContract } = useContract(GHO_SEPOLIA_ADDRESS);
  const {
    data: balanceData = BigNumber.from(0),
    isLoading: balanceOfLoading,
    refetch: refetchBalance,
  } = useContractRead(ghoContract, "balanceOf", [user?.address]);
  const balance = (balanceData / 10 ** 18).toFixed(2);
  const { contract: vaultContract } = useContract(VAULT_ADDRESS, VAULT_ABI);

  const { data: totalShares = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "totalAssets"
  );
  const readableTotalShares = parseFloat(
    formatUnits(totalShares.toString(), 18)
  );
  const { data: userBalance = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "totalAssetsOfUser",
    [user?.address]
  );
  const readableUserBalance = parseFloat(
    formatUnits(userBalance.toString(), 18)
  );
  const { data: vaultBalance = BigNumber.from(0) } = useContractRead(
    ghoContract,
    "balanceOf",
    [VAULT_ADDRESS]
  );
  const readableVaultBalance = parseFloat(
    formatUnits(vaultBalance.toString(), 18)
  );
  const { data: userShares = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "balanceOf",
    [user?.address]
  );
  const readableUserShares = parseFloat(formatUnits(userShares.toString(), 18));

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
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const { mutateAsync: withdraw, isLoading: isWithdrawing } = useContractWrite(
    vaultContract,
    "withdraw"
  );

  const canDeposit =
    depositAmount &&
    parseFloat(depositAmount) > 0 &&
    balanceData.gte(BigNumber.from(depositAmount));
  const canWithdraw = withdrawPercentage && withdrawPercentage > 0;

  const executeDeposit = async () => {
    try {
      const depositAmountInWei = BigNumber.from(depositAmount).mul(
        BigNumber.from(10).pow(18)
      );

      console.log({ depositAmount, depositAmountInWei });

      if (approvalData.eq(0)) {
        console.log("approving spending");
        const { receipt } = await approve({
          args: [VAULT_ADDRESS, ethers.constants.MaxUint256],
        });
      }

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
      refetchBalance();
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
      console.log({
        withdrawPercentage,
        userShares,
        x: withdrawPercentage / 100,
      });
      const percentage = BigNumber.from(Math.floor(withdrawPercentage));
      const withdrawAmountInWei = userShares.mul(percentage).div(100);

      const { receipt } = await withdraw({
        args: [withdrawAmountInWei, user?.address, user?.address],
      });

      if (receipt) {
        setWithdrawPercentage(0);
      }
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Withdrawn GHO successfully.",
      });
      refetchBalance();
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
            Your Vault balance
          </Text>
          <Text className="text-white font-bold text-center text-5xl">
            ${readableUserBalance.toFixed(2)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-around space-x-4">
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">GHO Balance</Text>
            <Text className="text-white text-2xl font-bold text-center">
              ${balance}
            </Text>
          </View>
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">
              Total Vault Balance
            </Text>
            <Text className="text-white text-2xl font-bold text-center">
              ${readableTotalShares.toFixed(2)}
            </Text>
          </View>
          <View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">APY</Text>
            <Text className="text-white text-2xl font-bold text-center">
              3%
            </Text>
          </View>

          {/*<View className="flex flex-col space-y-1 items-center">
            <Text className="text-[#53516C] font-semibold">Vault Balance</Text>
            <Text className="text-white text-2xl font-bold text-center">
              ${readableVaultBalance.toFixed(2)}
            </Text>
        </View>*/}
        </View>
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
          This is the % of GHO in the vault that you will withdraw. 100% will
          withdraw all of your GHO.
        </Text>

        <View className="mb-2 text-white px-2 py-3 rounded-md flex flex-row items-center justify-between">
          <Slider
            onValueChange={(value) => {
              setWithdrawPercentage(value);
            }}
            maximumValue={max}
            minimumValue={min}
            progress={progress}
            bubble={(s) => `${s.toFixed(0)}`}
            theme={{
              disableMinTrackTintColor: "#fff",
              maximumTrackTintColor: "#53516C",
              minimumTrackTintColor: "#C9B3F9",
              cacheTrackTintColor: "#333",
              bubbleBackgroundColor: "#666",
            }}
          />
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
