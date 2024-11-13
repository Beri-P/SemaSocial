// Messages.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { theme } from "../constants/theme";
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
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    console.warn("User is not authenticated or user data is not loaded.");
    return null;
  }

  const loadConversations = async () => {
    try {
      const result = await fetchConversations(user.id);
      if (result.success) {
        // Sort conversations by most recent first
        const sortedConversations = result.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      console.warn(
        "User ID is not available for subscriptions or fetching data."
      );
      return;
    }

    let messageSubscription;

    const setupSubscription = () => {
      messageSubscription = subscribeToMessages(user.id, (payload) => {
        if (payload.new) {
          setConversations((prevConversations) => {
            const newMessage = payload.new;
            const existingIndex = prevConversations.findIndex(
              (conv) => conv.id === newMessage.conversation_id
            );

            if (existingIndex >= 0) {
              const updatedConversations = [...prevConversations];
              const updatedConversation = {
                ...updatedConversations[existingIndex],
                last_message: newMessage.message_text,
                updated_at: newMessage.created_at,
                last_sender_id: newMessage.sender_id,
                unread_count:
                  newMessage.sender_id !== user.id
                    ? (updatedConversations[existingIndex].unread_count || 0) +
                      1
                    : updatedConversations[existingIndex].unread_count,
              };

              // Remove the conversation from its current position
              updatedConversations.splice(existingIndex, 1);
              // Add it to the beginning of the array
              updatedConversations.unshift(updatedConversation);

              return updatedConversations;
            }
            return prevConversations;
          });
        }
      });
    };

    const initialize = async () => {
      setLoading(true);
      await loadConversations();
      setupSubscription();
      setLoading(false);
    };

    initialize();

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [user.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversationId, otherUserId) => {
    if (!otherUserId) {
      console.warn("otherUserId is undefined. Skipping navigation.");
      return;
    }
    router.push({
      pathname: `/chat/[conversationId]`,
      params: { conversationId, otherUserId },
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No conversations yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Start a new conversation by tapping the plus button below
      </Text>
    </View>
  );

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

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            console.log("other_user_id in FlatList item:", item.other_user_id); // Debug line
            return (
              <MessageCard
                conversation={item}
                onPress={() =>
                  handleConversationPress(item.id, item.other_user_id)
                }
                currentUserId={user.id}
              />
            );
          }}
          contentContainerStyle={[
            styles.list,
            conversations.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />

        <FloatingButton
          icon="plus"
          onPress={() => router.push("/(main)/UserList")}
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
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.text,
  },
  list: {
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Messages;
