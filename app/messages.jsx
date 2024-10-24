import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import ScreenWrapper from "../components/ScreenWrapper";
import MessageCard from "../components/MessageCard";
import FloatingButton from "../components/FloatingButton";
import {
  fetchConversations,
  subscribeToMessages,
} from "../services/messageService";
import { useRouter } from "expo-router";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let messageSubscription;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const result = await fetchConversations(user.id);
        if (result.success) {
          setConversations(result.data);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time subscription
    const setupSubscription = () => {
      messageSubscription = subscribeToMessages(user.id, (payload) => {
        // Update conversations when new message arrives
        if (payload.new) {
          setConversations((prevConversations) => {
            const newMessage = payload.new;
            const existingIndex = prevConversations.findIndex(
              (conv) => conv.id === newMessage.conversation_id
            );

            if (existingIndex >= 0) {
              // Update existing conversation
              const updatedConversations = [...prevConversations];
              updatedConversations[existingIndex] = {
                ...updatedConversations[existingIndex],
                last_message: newMessage.message_text,
                updated_at: newMessage.created_at,
              };
              return updatedConversations;
            }
            // New conversation will be added on next fetch
            return prevConversations;
          });
        }
      });
    };

    loadConversations();
    setupSubscription();

    // Cleanup subscription
    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [user.id]);

  const handleConversationPress = (conversationId, otherUserId) => {
    router.push({
      pathname: `/chat/${conversationId}`,
      params: { otherUserId },
    });
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
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>

        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a new conversation by clicking the plus button below
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MessageCard
                conversation={item}
                onPress={() =>
                  handleConversationPress(item.id, item.other_user_id)
                }
                currentUserId={user.id}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        <FloatingButton
          icon="plus"
          onPress={() => router.push("/users")}
          style={styles.addButton}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: theme.colors.text,
  },
  list: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default Messages;
