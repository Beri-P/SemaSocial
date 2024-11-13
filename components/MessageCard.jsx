// MessageCard.jsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";

const MessageCard = ({ conversation, onPress, currentUserId }) => {
  const { other_user, last_message, updated_at, unread_count, last_sender_id } =
    conversation;

  const isUnread = unread_count > 0 && last_sender_id !== currentUserId;
  const formattedDate = updated_at
    ? formatDistanceToNow(new Date(updated_at), { addSuffix: true })
    : "Unknown Date";

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={other_user?.avatar_url} size={50} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text
              style={[styles.name, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {other_user?.name || "Unknown User"}
            </Text>
          </View>
          <Text style={styles.time}>{formattedDate}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[styles.message, isUnread && styles.unreadText]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {last_message}
          </Text>
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unread_count > 99 ? "99+" : unread_count}
              </Text>
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
    padding: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadContainer: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  avatarContainer: {
    marginRight: 16,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
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
    marginRight: 12,
    lineHeight: 20,
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
