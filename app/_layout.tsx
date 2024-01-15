import {
  ThirdwebProvider,
  embeddedWallet,
  smartWallet,
} from "@thirdweb-dev/react-native";
import { Slot } from "expo-router";
import { View } from "react-native";
import { sepolia } from "../constants/sepolia";
import { PaperProvider } from "react-native-paper";

export default function AppLayout() {
  //   const [fontsLoaded] = useFonts({});
  return (
    <PaperProvider>
      <ThirdwebProvider
        activeChain={sepolia.chainId}
        clientId={process.env.EXPO_PUBLIC_TW_CLIENT_ID}
        supportedChains={[sepolia]}
        supportedWallets={[
          smartWallet(
            embeddedWallet({
              auth: {
                options: ["email", "google"],
                redirectUrl: "ghost://",
              },
            }),
            {
              factoryAddress: process.env
                .EXPO_PUBLIC_TW_FACTORY_ADDRESS as string,
              gasless: true,
            }
          ),
        ]}
      >
        <View className="bg-[#201F2D] flex-1">
          <Slot />
        </View>
      </ThirdwebProvider>
    </PaperProvider>
  );
}
