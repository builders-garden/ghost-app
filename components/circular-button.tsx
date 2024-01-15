import { Pressable, View, Text } from "react-native";
import { Icon } from "react-native-paper";

export default function CircularButton({
  text,
  icon,
  onPress,
}: {
  text: string;
  icon: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-col items-center justify-center space-y-1">
        <View className="bg-[#C9B3F9] rounded-full w-16 h-16 flex items-center justify-center">
          <Icon source={icon} color="#201F2D" size={24} />
        </View>
        <Text className="text-white font-semibold">{text}</Text>
      </View>
    </Pressable>
  );
}
