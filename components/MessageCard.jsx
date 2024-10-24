import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";

const MessageCard = ({ conversation, onPress, currentUserId }) => {
  const {
    other_user_avatar,
    other_user_name,
    last_message,
    updated_at,
    unread_count,
    last_sender_id,
  } = conversation;

  const isUnread = unread_count > 0 && last_sender_id !== currentUserId;

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onPress}
    >
      <Avatar uri={other_user_avatar} size={50} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, isUnread && styles.unreadText]}>
            {other_user_name}
          </Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(updated_at), { addSuffix: true })}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[styles.message, isUnread && styles.unreadText]}
            numberOfLines={1}
          >
            {last_message}
          </Text>
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unreadContainer: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textLight,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default MessageCard;
