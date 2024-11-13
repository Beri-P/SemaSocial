// components/FloatingButton.js
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";
import * as Icons from "lucide-react-native";

const FloatingButton = ({ icon, onPress, style }) => {
  const IconComponent = Icons[icon.charAt(0).toUpperCase() + icon.slice(1)];

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconComponent size={24} color={theme.colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FloatingButton;
