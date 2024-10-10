// UserList.jsx
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router"; // Import useLocalSearchParams and useRouter

const UserList = () => {
  const { users } = useLocalSearchParams(); // Use useLocalSearchParams to get parameters from the URL
  const router = useRouter(); // Initialize the router for navigation

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a User to Message</Text>
      <FlatList
        data={JSON.parse(users)} // Parse the users if it's a string
        keyExtractor={(item) => item.id.toString()} // Ensure item.id is a string
        renderItem={({ item }) => (
          <Pressable
            style={styles.userCard}
            onPress={() => {
              // Navigate to the chat screen with the user ID
              router.push(`/chat/${item.id}`); // Use router for navigation
            }}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default UserList;

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
  userCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  userName: {
    fontSize: 18,
    color: "#333333",
  },
});
