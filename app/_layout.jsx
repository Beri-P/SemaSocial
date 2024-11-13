// app/_layout.jsx
import { LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { VideoProvider } from "../contexts/VideoContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

LogBox.ignoreLogs([
  "Warning: TRenderEngineProvider: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
  "Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.",
  "Warning: TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("session user: ", session?.user?.id);

        if (session) {
          setAuth(session.user);
          updateUserData(session.user);
          router.replace("/tabs/home");
        } else {
          setAuth(null);
          router.replace("/welcome");
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const updateUserData = async (user) => {
    let res = await getUserData(user.id);
    if (res.success) setUserData(res.data);
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
};

const Layout = () => (
  <AuthProvider>
    <VideoProvider>
      <MainLayout />
    </VideoProvider>
  </AuthProvider>
);

export default Layout;
