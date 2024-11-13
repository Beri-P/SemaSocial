// forgotPassword.jsx
import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const ForgotPassword = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!emailRef.current) {
      Alert.alert("Reset Password", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        emailRef.current.trim(),
        {
          redirectTo: "yourapp://reset-password",
        }
      );

      if (error) throw error;

      Alert.alert(
        "Reset Password",
        "Check your email for the password reset link",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Header */}
        <View>
          <Text style={styles.headerText}>Forgot Password</Text>
          <Text style={styles.subHeaderText}>
            Don't worry! It happens. Please enter the email address associated
            with your account.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Button
            title="Send Reset Link"
            loading={loading}
            onPress={handleResetPassword}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  headerText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subHeaderText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    marginTop: hp(1),
  },
  form: {
    gap: 25,
  },
});
