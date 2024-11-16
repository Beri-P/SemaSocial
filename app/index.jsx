//index.jsx
import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/tabs/home");
      } else {
        router.replace("/welcome");
      }
    }
  }, [isLoading, user]);

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Loading />
      </View>
    </ScreenWrapper>
  );
};

export default Index;
