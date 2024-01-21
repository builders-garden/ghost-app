import {
  SmartContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react-native";
import { BigNumber, ethers } from "ethers";
import { useSharedValue } from "react-native-reanimated";
import { useUserStore } from "../../store";
import { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Slider } from "react-native-awesome-slider";
import AppButton from "../app-button";
import Toast from "react-native-toast-message";
import { formatUnits } from "viem";
import { DAI_ADDRESS } from "../../constants/sepolia";

export default function LendingWithdraw({
  balanceData,
  balanceOfLoading,
  refetchBalance,
  aavePoolContract,
  ghoContract,
}: {
  balanceData: BigNumber;
  balanceOfLoading: boolean;
  refetchBalance: () => void;
  aavePoolContract: SmartContract<ethers.BaseContract> | undefined;
  ghoContract: SmartContract<ethers.BaseContract> | undefined;
}) {
  const user = useUserStore((state) => state.user);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);

  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const { mutateAsync: withdraw, isLoading: isWithdrawing } = useContractWrite(
    aavePoolContract,
    "withdraw"
  );

  const {
    data: userData = [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)],
    isLoading,
  } = useContractRead(
    aavePoolContract,
    "getUserAccountData",
    [user?.address]
    // ["0x0e07Ed3049FD6408AEB26049e76609e0491b3A49"]
  );
  const canWithdraw = withdrawPercentage && withdrawPercentage > 0;
  const withdrawable = parseFloat(formatUnits(userData[0].sub(userData[1]), 8));

  const executeWithdraw = async () => {
    try {
      const percentage = BigNumber.from(Math.floor(withdrawPercentage));
      const withdrawAmountInWei = userData[0]
        .sub(userData[1])
        .mul(percentage)
        .div(100)
        .mul(BigNumber.from(10).pow(10));

      const { receipt } = await withdraw({
        args: [DAI_ADDRESS, withdrawAmountInWei, user?.address],
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
  return (
    <View className="flex flex-col">
      <Text className="text-white mt-4 mb-4">
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
  );
}
