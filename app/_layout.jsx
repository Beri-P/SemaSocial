// app/_layout.jsx
import { LogBox } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { VideoProvider } from "../contexts/VideoContext";

// Ignore specific logs that are not relevant to app functionality
LogBox.ignoreLogs([
  "Warning: TRenderEngineProvider: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
  "Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.",
  "Warning: TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

// Set up a global handler for unhandled promise rejections in development mode only
if (__DEV__) {
  globalThis.onunhandledrejection = (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
  };
}

const MainLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
};

// Wrap MainLayout with necessary providers for app-wide contexts
const Layout = () => (
  <AuthProvider>
    <VideoProvider>
      <MainLayout />
    </VideoProvider>
  </AuthProvider>
);

export default Layout;
