import { Tabs } from "expo-router";
import { View } from "react-native";
import { Icon } from "react-native-paper";

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              source="home"
              color={focused ? "#C9B3F9" : "#53516C"}
              size={24}
            />
          ),
          headerShown: false,
          title: "Home",
          tabBarInactiveTintColor: "#53516C",
          tabBarActiveTintColor: "#C9B3F9",
          tabBarBackground: () => <View className="bg-[#201F2D] flex-1" />,
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              source="send"
              color={focused ? "#C9B3F9" : "#53516C"}
              size={24}
            />
          ),
          headerShown: false,
          title: "Send",
          tabBarInactiveTintColor: "#53516C",
          tabBarActiveTintColor: "#C9B3F9",
          tabBarBackground: () => <View className="bg-[#201F2D] flex-1" />,
        }}
      />
      <Tabs.Screen
        name="pocket"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              source="briefcase-variant"
              color={focused ? "#C9B3F9" : "#53516C"}
              size={24}
            />
          ),
          headerShown: false,
          title: "Pocket",
          tabBarInactiveTintColor: "#53516C",
          tabBarActiveTintColor: "#C9B3F9",
          tabBarBackground: () => <View className="bg-[#201F2D] flex-1" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              source="cog"
              color={focused ? "#C9B3F9" : "#53516C"}
              size={24}
            />
          ),
          headerShown: false,
          title: "Settings",
          tabBarInactiveTintColor: "#53516C",
          tabBarActiveTintColor: "#C9B3F9",
          tabBarBackground: () => <View className="bg-[#201F2D] flex-1" />,
        }}
      />
    </Tabs>
  );
}
