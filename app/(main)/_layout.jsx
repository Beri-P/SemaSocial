// app/(main)/_layout.jsx
import { Stack } from "expo-router";

export default function MainStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="postDetails" options={{ presentation: "modal" }} />
      <Stack.Screen name="UserList" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[conversationId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="chat/new" options={{ headerShown: false }} />
    </Stack>
  );
}
