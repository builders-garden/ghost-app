import { Text, TouchableOpacity, View } from "react-native";

export default function AppButton({
  text,
  onPress,
  variant = "primary",
}: {
  text: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "disabled";
}) {
  if (variant === "ghost") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-transparent border-2 border-[#C9B3F9] rounded-md flex items-center justify-center py-3"
      >
        <Text className="text-lg text-[#C9B3F9] font-semibold">{text}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === "disabled") {
    return (
      <View className="bg-transparent border-2 border-gray-400 rounded-md flex items-center justify-center py-3">
        <Text className="text-lg text-gray-400 font-semibold">{text}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#C9B3F9] border-2 border-[#C9B3F9] rounded-md flex items-center justify-center py-3"
    >
      <Text className="text-lg text-black font-semibold">{text}</Text>
    </TouchableOpacity>
  );
}
