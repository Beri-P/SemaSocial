//signUp.jsx
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();
    const name = nameRef.current.trim();

    if (!email || !password || !name) {
      Alert.alert("Sign Up", "Please fill all the fields!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Sign Up", "Please enter a valid email address!");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Sign Up", "Password must be at least 6 characters long!");
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    try {
      if (!validateInputs()) return;

      const name = nameRef.current.trim();
      const email = emailRef.current.trim();
      const password = passwordRef.current.trim();

      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            email: email,
            avatar_url: null,
            updated_at: new Date().toISOString(),
          },
          // Removed emailRedirectTo as it's not needed in React Native
        },
      });

      console.log("Sign-up attempt with:", {
        email,
        metadata: {
          name,
          email,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
      });

      if (error) {
        console.error("Detailed error:", error);
        throw error;
      }

      if (data?.user) {
        console.log("Success! User data:", data.user);
        Alert.alert(
          "Sign Up Successful",
          "Please check your email for verification instructions.",
          [
            {
              text: "OK",
              onPress: () => router.push("login"),
            },
          ]
        );
      } else {
        throw new Error("No user data returned");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "Sign Up Error",
        error.message || "An unexpected error occurred during sign up."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please fill the details to create a new account
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your username"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          {/* Button */}
          <Button title={"Sign Up"} loading={loading} onPress={onSubmit} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push("login")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
