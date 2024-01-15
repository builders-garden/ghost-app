import { Pressable, View, Image } from "react-native";
import { Link, router } from "expo-router";
import { Appbar, Icon } from "react-native-paper";
import { Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import React, { useEffect } from "react";
import RNQRGenerator from "rn-qr-generator";
import { useUserStore } from "../../store";

export default function AddMoneyModal() {
  const isPresented = router.canGoBack();
  const user = useUserStore((state) => state.user);
  const [copied, setCopied] = React.useState(false);
  const [qrText, setQRText] = React.useState("");

  useEffect(() => {
    if (user) {
      RNQRGenerator.generate({
        value: user?.smartWalletAddress,
        height: 400,
        width: 400,
        correctionLevel: "H",
        base64: true,
      })
        .then((response) => {
          const { base64 } = response;
          base64 && setQRText(base64);
        })
        .catch((error) => console.error(error));
    }
  }, [user]);

  return (
    <View className="flex-1 flex-col px-4 bg-[#201F2D]">
      {!isPresented && <Link href="../">Dismiss</Link>}
      <Appbar.Header
        elevated={false}
        statusBarHeight={0}
        className="bg-[#201F2D] text-white"
      >
        <Appbar.Content
          title="Add money"
          color="#fff"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action
          icon={() => <Icon source="close" size={24} color="#FFF" />}
          onPress={() => router.back()}
          color="#fff"
          size={20}
        />
      </Appbar.Header>
      <Text className="text-[#53516C] font-semibold mt-8">
        Add money to account
      </Text>
      <Text className="text-white font-semibold mt-2">
        Send GHO, USDC, USDT or DAI to your address below.
      </Text>
      <View className="bg-[#292836] rounded-lg flex flex-row justify-between mt-4 px-4 py-2">
        <Text className="text-[#53516C] text-ellipsis">
          {user?.smartWalletAddress}
        </Text>
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(user!.smartWalletAddress);
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
      {qrText && (
        <View className="flex items-center justify-center mt-8">
          <Image
            className="h-[300px] w-[300px]"
            source={{ uri: `data:image/png;base64,${qrText}` }}
          />
        </View>
      )}
    </View>
  );
}
