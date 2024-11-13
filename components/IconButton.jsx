// components/IconButton.js
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

const IconButton = ({
  icon: Icon,
  size = 24,
  color,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Icon
        size={size}
        color={disabled ? theme.colors.darkLight : color}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default IconButton;
