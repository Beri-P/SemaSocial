import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { fetchMessages } from "../services/messageService";
import { fetchUsers } from "../services/userService";
import { useRouter } from "expo-router"; // Import useRouter from expo-router

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  const router = useRouter(); // Use the router hook

  useEffect(() => {
    const getMessages = async () => {
      const res = await fetchMessages(user.id);
      if (res.success) setMessages(res.data);
    };
    getMessages();
  }, []);

  const handleUserPress = (userId) => {
    router.push(`/chat/${userId}`); // Navigate to the chat with the selected user
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>

        {messages.length === 0 ? (
          <Text style={styles.noMessagesText}>No messages available</Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => handleUserPress(item.receiver_id)} // Adjust as needed
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.receiver_name}</Text>
                  <Text style={styles.messageText}>{item.message_text}</Text>
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.messageList}
          />
        )}

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/UserList")} // Navigate to User List
        >
          <Icon name="plus" size={30} color={theme.colors.white} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 15,
  },
  noMessagesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  messageList: {
    paddingBottom: 80, // Space for the floating button
  },
  card: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  messageText: {
    fontSize: 14,
    color: "#333333",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
