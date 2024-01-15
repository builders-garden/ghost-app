import { View, Text, Pressable, Switch } from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { Redirect, router } from "expo-router";
import Avatar from "../../../components/avatar";
import * as Clipboard from "expo-clipboard";
import AppButton from "../../../components/app-button";
import { useConnectedWallet } from "@thirdweb-dev/react-native";
import * as WebBrowser from "expo-web-browser";
import { sepolia } from "../../../constants/sepolia";
import { useState } from "react";
import { useUserStore } from "../../../store";

export default function Settings() {
  const signer = useConnectedWallet();
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const user = useUserStore((state) => state.user);
  const [isEnabled, setIsEnabled] = useState(user?.rounding);

  if (!signer || !user) {
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
          title="Settings"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
      </Appbar.Header>
      <View className="flex-1 flex-col px-4 bg-[#201F2D]">
        <View className="flex-1 flex-col px-4 mt-4">
          <View className="flex flex-row space-x-4 items-center mb-8">
            <Avatar name={user.username.charAt(0).toUpperCase()} />
            <View className="flex flex-col space-y-1">
              <View className="flex flex-row space-x-2 items-center">
                <Text className="text-white font-semibold">
                  {user.username}
                </Text>
                <Pressable
                  onPress={() => Clipboard.setStringAsync(user.username)}
                >
                  <Icon source="clipboard" size={16} color="#FFF" />
                </Pressable>
              </View>
              <Text className="text-[#53516C] font-semibold">
                GHO • Sepolia
              </Text>
            </View>
          </View>
          <AppButton
            text="VIEW ACCOUNT ON EXPLORER"
            onPress={async () => {
              await WebBrowser.openBrowserAsync(
                `${sepolia.explorers[0].url}/address/${user?.smartWalletAddress}`
              );
            }}
            variant="ghost"
          />
          <Text className="text-[#53516C] font-semibold mt-8">Preferences</Text>
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
          <View className="mt-8">
            <AppButton
              text="EXPORT PRIVATE KEY"
              onPress={() => {
                router.push("/app/export-private-key-modal");
              }}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </>
  );
}
