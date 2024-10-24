//app/chat.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";
import ScreenWrapper from "../components/ScreenWrapper";
import {
  fetchMessages,
  sendMessage,
  markConversationAsRead,
  subscribeToMessages,
} from "../services/messageService";
import MessageBubble from "../components/MessageBubble";
import IconButton from "../components/IconButton";
import { Camera, Image as ImageIcon, Send } from "lucide-react";
import * as ImagePicker from "expo-image-picker";

const Chat = () => {
  const { conversationId, otherUserId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    let messageSubscription;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const result = await fetchMessages(conversationId);
        if (result.success) {
          setMessages(result.data);
          await markConversationAsRead(conversationId, user.id);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = () => {
      messageSubscription = subscribeToMessages(user.id, (payload) => {
        if (payload.new && payload.new.conversation_id === conversationId) {
          setMessages((prev) => [...prev, payload.new]);
          markConversationAsRead(conversationId, user.id);
          scrollToBottom();
        }
      });
    };

    loadMessages();
    setupSubscription();

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [conversationId, user.id]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      const result = await sendMessage({
        conversationId,
        senderId: user.id,
        text: inputText.trim(),
        attachments,
      });

      if (result.success) {
        setInputText("");
        setAttachments([]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset) => ({
          uri: asset.uri,
          type: "image",
          name: asset.uri.split("/").pop(),
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleCameraLaunch = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newAttachment = {
          uri: result.assets[0].uri,
          type: "image",
          name: result.assets[0].uri.split("/").pop(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      }
    } catch (error) {
      console.error("Error using camera:", error);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const renderMessage = ({ item }) => (
    <MessageBubble message={item} isOwn={item.sender_id === user.id} />
  );

  const renderAttachmentPreview = () => {
    if (attachments.length === 0) return null;

    return (
      <View style={styles.attachmentPreview}>
        {attachments.map((attachment, index) => (
          <Pressable
            key={index}
            style={styles.attachmentItem}
            onPress={() => removeAttachment(index)}
          >
            <View style={styles.removeButton}>
              <IconButton
                icon="x"
                size={16}
                color={theme.colors.white}
                onPress={() => removeAttachment(index)}
              />
            </View>
            {attachment.type === "image" && (
              <Image
                source={{ uri: attachment.uri }}
                style={styles.attachmentImage}
              />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          inverted={false}
        />

        {renderAttachmentPreview()}

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <IconButton
              icon={Camera}
              size={24}
              color={theme.colors.textLight}
              onPress={handleCameraLaunch}
              style={styles.inputIcon}
            />
            <IconButton
              icon={ImageIcon}
              size={24}
              color={theme.colors.textLight}
              onPress={handleImagePick}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              multiline
              maxHeight={100}
            />
            <IconButton
              icon={Send}
              size={24}
              color={theme.colors.primary}
              onPress={handleSend}
              disabled={
                sending || (!inputText.trim() && attachments.length === 0)
              }
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 8,
    backgroundColor: theme.colors.white,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    backgroundColor: theme.colors.white,
  },
  inputIcon: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  attachmentPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    backgroundColor: theme.colors.white,
  },
  attachmentItem: {
    width: 80,
    height: 80,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
});

export default Chat;
