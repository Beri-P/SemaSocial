//chat/new.jsx
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from "../../../constants/theme";
import { getOrCreateConversation } from "../../../services/messageService"; // You'll need to create this service
import { useAuth } from "../../../contexts/AuthContext";

const NewChat = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { otherUserId } = useLocalSearchParams();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const result = await getOrCreateConversation(user.id, otherUserId);
        if (result.success) {
          router.replace({
            pathname: "/(main)/chat",
            params: {
              conversationId: result.data.id,
              otherUserId: otherUserId,
            },
          });
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    };

    initializeChat();
  }, [otherUserId, user.id]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default NewChat;
