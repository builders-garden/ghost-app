import { Redirect, router } from "expo-router";
import { View, Text, Image, Pressable } from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { useUserStore } from "../../../store";
import AppButton from "../../../components/app-button";
import { useContract, useContractRead } from "@thirdweb-dev/react-native";
import {
  AAVE_BORROW_ADDRESS,
  AUSDC_ADDRESS,
  AUSDT_ADDRESS,
  GHO_ASSET_PRICE,
} from "../../../constants/sepolia";
import { BigNumber } from "ethers";

export default function Pocket() {
  const user = useUserStore((state) => state.user);
  const { contract } = useContract(AAVE_BORROW_ADDRESS);
  const { data: userData, isLoading } = useContractRead(
    contract,
    "getUserAccountData",
    [user?.address]
    // ["0x0e07Ed3049FD6408AEB26049e76609e0491b3A49"]
  );
  const { contract: aUSDTContract } = useContract(AUSDT_ADDRESS);
  const { contract: aUSDCContract } = useContract(AUSDC_ADDRESS);
  const { data: aUSDTBalance = BigNumber.from(0) } = useContractRead(
    aUSDTContract,
    "balanceOf",
    [user?.address]
  );
  const { data: aUSDCBalance = BigNumber.from(0) } = useContractRead(
    aUSDCContract,
    "balanceOf",
    [user?.address]
  );
  const { contract: vaultContract } = useContract("");
  const { data: userShares = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "balanceOf",
    [user?.address]
  );
  const { data: userVaultBalance = BigNumber.from(0) } = useContractRead(
    vaultContract,
    "convertUserSharesToAssets",
    [user?.address, userShares]
  );
  const vaultBalance = userVaultBalance
    .div(BigNumber.from(10).pow(18))
    .toNumber();
  const aaveLendingBalance = aUSDTBalance
    .div(BigNumber.from(10).pow(6))
    .add(aUSDCBalance.div(BigNumber.from(10).pow(6)))
    .toNumber();

  if (!user) {
    return <Redirect href={"/"} />;
  }

  return (
    <>
      <Appbar.Header className="bg-[#201F2D] text-white">
        <Appbar.BackAction
          onPress={() => router.back()}
          color="#fff"
          size={20}
        />
        <Appbar.Content
          title="Pocket"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action
          icon={() => <Icon source="info-circle" size={24} color="#FFF" />}
          onPress={() => router.push("/app/pocket-info-modal")}
        />
      </Appbar.Header>
      <View className="flex-1 flex-col items-center justify-center w-full px-4 bg-[#201F2D]">
        <View className="px-14">
          <View className="flex flex-col space-y-4 pb-8 pt-4">
            <Text className="text-white font-semibold text-center">
              Pocket balance
            </Text>
            <Text className="text-white font-bold text-center text-5xl">
              ${(vaultBalance + aaveLendingBalance).toFixed(2)}
            </Text>
          </View>
        </View>
        <View className="border-2 border-[#C9B3F9] w-full p-3 rounded-lg flex flex-row items-center justify-between">
          <View className="flex flex-row space-x-2 items-center">
            <Image
              source={require("../../../images/ghost.png")}
              className="h-14 w-14"
            />
            <View className="flex flex-col items-start">
              <Text className="text-white text-lg font-black text-center">
                AAVE Lending
              </Text>
              <Text className="text-white/80 font-semibold">
                ${aaveLendingBalance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View className="flex flex-row items-center space-x-4 justify-between">
            <View className="flex flex-col mr-6 items-end">
              <Text className="text-lg text-emerald-500 font-semibold">
                1.5%
              </Text>
              <Text className="text-[#53516C]">APY</Text>
            </View>
            {/* <Icon source="chevron-right" size={16} color="#C9B3F9" /> */}
          </View>
        </View>
        <Pressable
          className="border-2 border-[#C9B3F9] w-full p-3 rounded-lg flex flex-row items-center justify-between mt-4"
          onPress={() => router.push("/app/vault-modal")}
        >
          <View className="flex flex-row space-x-2 items-center">
            <Image
              source={require("../../../images/ghost.png")}
              className="h-14 w-14"
            />
            <View className="flex flex-col items-start">
              <Text className="text-white text-lg font-black text-center">
                GHO Vault
              </Text>
              <Text className="text-white/80 font-semibold">
                ${vaultBalance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View className="flex flex-row items-center space-x-4 justify-between">
            <View className="flex flex-col mr-6 items-end">
              <Text className="text-lg text-emerald-500 font-semibold">3%</Text>
              <Text className="text-[#53516C]">APY</Text>
            </View>
            <Icon source="chevron-right" size={16} color="#C9B3F9" />
          </View>
        </Pressable>
        <View className="my-8 flex items-center w-full">
          <View className="px-14">
            <View className="flex flex-col space-y-4 pb-8 pt-4">
              <Text className="text-white font-semibold text-center">
                Borrow balance
              </Text>
              <Text className="text-white font-bold text-center text-5xl">
                $
                {userData && userData[1]
                  ? parseFloat(
                      userData[1].div(GHO_ASSET_PRICE).toString()
                    ).toFixed(2)
                  : "0.00"}
              </Text>
            </View>
          </View>
          <View className="w-full">
            <AppButton
              text="Borrow GHO"
              onPress={() => router.push("/app/borrow-modal")}
            />
          </View>
        </View>
      </View>
    </>
  );
}
