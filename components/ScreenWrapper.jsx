import { View, Text, StatusBar } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ScreenWrapper = ({ children, bg }) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg }}>
      {/* Set the status bar style and background color */}
      <StatusBar barStyle="dark-content" backgroundColor={bg} />
      {children}
    </View>
  );
};

export default ScreenWrapper;
