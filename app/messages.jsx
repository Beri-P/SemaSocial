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
import supabase from "../lib/supabase";

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
      console.log("Fetching conversations for user:", user.id);
      const result = await fetchConversations(user.id);
      if (result.success) {
        // Filter out any conversations with invalid IDs and sort by most recent
        const validConversations = result.data
          .filter((conversation) => conversation && conversation.id)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        console.log("Transformed conversations:", validConversations); // Add this log
        setConversations(validConversations);
      } else {
        console.error("Error in loadConversations:", result.error);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]); // Set empty array on error
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log("Current user ID:", user.id);
      // Test direct query to conversations table
      const testQuery = async () => {
        try {
          const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

          if (error) {
            console.error("Supabase query error:", error);
            return;
          }
          console.log("Direct query result:", data);
        } catch (err) {
          console.error("Error in test query:", err);
        }
      };
      testQuery();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      console.warn(
        "User ID is not available for subscriptions or fetching data."
      );
      return;
    }

    let messageSubscription;
    let isMounted = true;

    const setupSubscription = () => {
      try {
        messageSubscription = subscribeToMessages(user.id, (payload) => {
          if (!isMounted) return;

          if (payload.new) {
            setConversations((prevConversations) => {
              const newMessage = payload.new;
              if (!newMessage?.conversation_id) {
                console.warn("Received message with invalid conversation_id");
                return prevConversations;
              }

              const existingIndex = prevConversations.findIndex(
                (conv) => conv?.id === newMessage.conversation_id
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
                      ? (updatedConversations[existingIndex].unread_count ||
                          0) + 1
                      : updatedConversations[existingIndex].unread_count,
                };

                updatedConversations.splice(existingIndex, 1);
                updatedConversations.unshift(updatedConversation);

                return updatedConversations;
              }
              return prevConversations;
            });
          }
        });
      } catch (error) {
        console.error("Error setting up message subscription:", error);
      }
    };

    const initialize = async () => {
      try {
        setLoading(true);
        console.log("Initializing with user ID:", user.id);
        await loadConversations();
        setupSubscription();
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversationId, otherUserId) => {
    if (!conversationId || !otherUserId) {
      console.warn("Missing required data for navigation:", {
        conversationId,
        otherUserId,
      });
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

  const renderItem = ({ item }) => {
    if (!item?.id || !item?.other_user_id) {
      console.warn("Invalid conversation data:", item);
      return null;
    }

    return (
      <MessageCard
        conversation={item}
        onPress={() => handleConversationPress(item.id, item.other_user_id)}
        currentUserId={user.id}
      />
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
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>

        <FlatList
          data={conversations}
          keyExtractor={(item) =>
            item?.id ? item.id.toString() : Math.random().toString()
          }
          renderItem={renderItem}
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
