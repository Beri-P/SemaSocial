import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { theme } from "../constants/theme";
import { formatDistanceToNow } from "date-fns";

const MessageBubble = ({ message, isOwn }) => {
  const { message_text, created_at, attachments, users: sender } = message;

  const renderAttachments = () => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment, index) => {
          if (attachment.type === "image") {
            return (
              <Pressable
                key={index}
                style={styles.imageContainer}
                onPress={() => {
                  // Handle image preview
                }}
              >
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              </Pressable>
            );
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwn && (
        <Image source={{ uri: sender.avatar_url }} style={styles.avatar} />
      )}

      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
      >
        {renderAttachments()}

        {message_text && (
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.ownText : styles.otherText,
            ]}
          >
            {message_text}
          </Text>
        )}

        <Text
          style={[
            styles.timestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp,
          ]}
        >
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  ownContainer: {
    justifyContent: "flex-end",
  },
  otherContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  otherBubble: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: theme.colors.white,
  },
  otherText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherTimestamp: {
    color: theme.colors.textLight,
  },
  attachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 4,
    marginBottom: 4,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});

export default MessageBubble;
