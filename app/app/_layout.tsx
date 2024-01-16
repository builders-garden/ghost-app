import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-money-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="borrow-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="export-private-key-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="pocket-info-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="send-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="vault-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
