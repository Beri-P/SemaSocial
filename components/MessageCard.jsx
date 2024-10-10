// /components/MessageCard.jsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar"; // Assuming you have an Avatar component

const MessageCard = ({ message }) => {
  return (
    <TouchableOpacity style={styles.container}>
      {/* Avatar and message info */}
      <Avatar size={hp(5)} uri={message.userImage} rounded={theme.radius.md} />
      <View style={styles.info}>
        <Text style={styles.username}>{message.user}</Text>
        <Text style={styles.message}>{message.message}</Text>
      </View>
      <Text style={styles.time}>{message.time}</Text>
    </TouchableOpacity>
  );
};

export default MessageCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: wp(4),
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.white,
    marginBottom: hp(1.5),
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  info: {
    flex: 1,
    marginLeft: wp(3),
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  message: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  time: {
    fontSize: hp(1.5),
    color: theme.colors.gray,
  },
});
