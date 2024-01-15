import { Redirect, router } from "expo-router";
import { View, Text, Image } from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { useUserStore } from "../../../store";
import AppButton from "../../../components/app-button";
import { useContract, useContractRead } from "@thirdweb-dev/react-native";
import {
  AAVE_BORROW_ADDRESS,
  GHO_ASSET_PRICE,
} from "../../../constants/sepolia";

export default function Pocket() {
  const user = useUserStore((state) => state.user);
  const { contract } = useContract(AAVE_BORROW_ADDRESS);
  const { data: userData, isLoading } = useContractRead(
    contract,
    "getUserAccountData",
    [user?.address]
    // ["0x0e07Ed3049FD6408AEB26049e76609e0491b3A49"]
  );

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
        />
      </Appbar.Header>
      <View className="flex-1 flex-col w-full px-4 bg-[#201F2D]">
        <Text className="text-white text-justify">
          Welcome to your <Text className="font-bold">GHOst pocket</Text>! Here
          you can deposit your GHO tokens into a vault or as a liquidity
          provider to start earn some interest!
        </Text>
        <View className="px-14">
          <View className="flex flex-col space-y-4 pb-8 pt-4">
            <Text className="text-white font-semibold text-center">
              Your balance
            </Text>
            <Text className="text-white font-bold text-center text-5xl">
              $83.00
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
                Vault
              </Text>
              <Text className="text-white/80 font-semibold">$53.00</Text>
            </View>
          </View>
          <View className="flex flex-row items-center space-x-4 justify-between">
            <View className="flex flex-col mr-6 items-end">
              <Text className="text-lg text-emerald-500 font-semibold">
                10.00%
              </Text>
              <Text className="text-[#53516C]">APY</Text>
            </View>
            <Icon source="chevron-right" size={16} color="#C9B3F9" />
          </View>
        </View>
        <View className="border-2 border-[#C9B3F9] w-full p-3 rounded-lg flex flex-row items-center justify-between mt-4">
          <View className="flex flex-row space-x-2 items-center">
            <Image
              source={require("../../../images/ghost.png")}
              className="h-14 w-14"
            />
            <View className="flex flex-col items-start">
              <Text className="text-white text-lg font-black text-center">
                LP
              </Text>
              <Text className="text-white/80 font-semibold">$30.00</Text>
            </View>
          </View>
          <View className="flex flex-row items-center space-x-4 justify-between">
            <View className="flex flex-col mr-6 items-end">
              <Text className="text-lg text-emerald-500 font-semibold">
                8.70%
              </Text>
              <Text className="text-[#53516C]">APY</Text>
            </View>
            <Icon source="chevron-right" size={16} color="#C9B3F9" />
          </View>
        </View>
        {/* <View className="flex-grow" /> */}
        {/* <View className="flex flex-row justify-between mt-2 mb-4">
          <Text className="max-w-[300px] text-white">
            Set aside the remainder of each purchase rounded to the nearest
            dollar (if you pay $1.30 set aside $0.70). This is enabled by
            default.
          </Text>
          <Switch
            trackColor={{ false: "black", true: "#C9B3F9" }}
            thumbColor={"#201F2D"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            disabled
          />
        </View> */}
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
        {/* <View className="p-14">
          <ImageBackground
            source={require("../../../images/ghost.png")}
            className="flex flex-col space-y-4 py-8 bg-opacity-20"
            imageStyle={{ opacity: 0.1 }}
          >
            <Text className="text-white font-semibold text-center">
              Your balance
            </Text>
            <Text className="text-white font-bold text-center text-5xl">
              $83.00
            </Text>
            <View className="flex flex-row justify-evenly items-center">
              <CircularButton
                text="Deposit"
                icon="credit-card-alt"
                onPress={() => router.push("/app/add-money-modal")}
              />
              <CircularButton
                text="Withdraw"
                icon="download"
                onPress={() => {}}
              />
              <CircularButton
                text="Borrow"
                icon="money"
                onPress={() => router.push("/app/borrow-modal")}
              />
            </View>
          </ImageBackground>
        </View> */}
      </View>
    </>
  );
}
