import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Switch, View, Text } from "react-native";
import { Appbar, Icon } from "react-native-paper";
import CircularButton from "../../../components/circular-button";
import { useUserStore } from "../../../store";

export default function Pocket() {
  const user = useUserStore((state) => state.user);
  const [isEnabled, setIsEnabled] = useState(user?.rounding);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

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
          icon={() => (
            <Icon source="information-outline" size={24} color="#FFF" />
          )}
        />
      </Appbar.Header>
      <View className="flex-1 flex-col px-4 bg-[#201F2D]">
        <View className="flex flex-row justify-between mt-2">
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
        </View>
        <View className="px-24 pt-12 flex flex-col space-y-4">
          <Text className="text-[#53516C] font-semibold text-center">
            Your balance
          </Text>
          <Text className="text-white font-bold text-center text-5xl">
            $83.00
          </Text>
          <View className="flex flex-row justify-evenly items-center">
            <CircularButton
              text="Add money"
              icon="plus"
              onPress={() => router.push("/app/add-money-modal")}
            />
            <CircularButton
              text="Withdraw"
              icon="download"
              onPress={() => {}}
            />
          </View>
        </View>
        <View className="flex flex-row items-center justify-evenly">
          <View className="flex flex-col items-center justify-center">
            <Text className="text-[#53516C] font-semibold text-lg mt-8">
              Total staked
            </Text>
            <Text className="text-white font-bold text-center text-2xl">
              $1012.30
            </Text>
          </View>
          <View className="flex flex-col items-center justify-center">
            <Text className="text-[#53516C] font-semibold text-lg mt-8">
              Your share
            </Text>
            <Text className="text-white font-bold text-center text-2xl">
              0.1%
            </Text>
          </View>
          <View className="flex flex-col items-center justify-center">
            <Text className="text-[#53516C] font-semibold text-lg mt-8">
              Earned fees
            </Text>
            <Text className="text-white font-bold text-center text-2xl">
              $4.00
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
