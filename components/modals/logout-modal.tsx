import { Modal, Portal } from "react-native-paper";
import { Text, View } from "react-native";
import AppButton from "../app-button";
import { useDisconnect } from "@thirdweb-dev/react-native";
import { firebaseAuth } from "../../firebaseConfig";

export default function LogoutModal({
  visible,
  hideModal,
}: {
  visible: boolean;
  hideModal: () => void;
}) {
  const disconnect = useDisconnect();
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal}>
        <View className="bg-[#201F2D] rounded-lg p-4 mx-4">
          <Text className="text-center text-white">
            Are you sure you want to logout?
          </Text>
          <Text className="text-center text-white mb-4">
            You will need to login again if confirmed.
          </Text>
          <AppButton
            text="Confirm logout"
            onPress={async () => {
              await firebaseAuth.signOut();
              await disconnect();
            }}
          />
        </View>
      </Modal>
    </Portal>
  );
}
