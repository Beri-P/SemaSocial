// app/UserList.jsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../../constants/theme";
import { useRouter } from "expo-router";
import { fetchUsers } from "../../services/userService";
import { getOrCreateConversation } from "../../services/messageService";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";
import { hp, wp } from "../../helpers/common";

const UserCard = ({ user, onPress, pressed, currentUserId }) => {
  console.log(
    `Rendering UserCard for user ${user.id}, currentUserId: ${currentUserId}`
  );
  return (
    <Pressable
      style={[styles.userCard, pressed && styles.userCardPressed]}
      onPress={onPress}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userInfoContainer}>
          <Avatar
            uri={user.image}
            size={50}
            style={styles.avatar}
            fallback={user.name?.[0]?.toUpperCase()}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio || "No bio available"}
            </Text>
          </View>
        </View>
        <Icon
          name="arrowLeft"
          size={24}
          color={theme.colors.gray}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      if (authLoading) return;

      try {
        setLoading(true);
        setError(null);
        const result = await fetchUsers();

        console.log("Current user ID:", currentUser?.id);
        console.log("Fetched users:", result.data);

        if (result.success && Array.isArray(result.data)) {
          const filteredUsers = result.data.filter((user) => {
            const isNotCurrentUser = user.id !== currentUser?.id;
            console.log(
              `Filtering user ${user.id}: isNotCurrentUser=${isNotCurrentUser}`
            );
            return isNotCurrentUser;
          });

          console.log("Filtered users:", filteredUsers);
          setUsers(filteredUsers);
        } else {
          setError(result.msg || "Error fetching users.");
        }
      } catch (error) {
        console.error("Error loading users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && currentUser?.id) {
      console.log("Loading users for currentUser:", currentUser?.id);
      loadUsers();
    }
  }, [currentUser?.id, authLoading]);

  const handleUserPress = async (selectedUser) => {
    try {
      console.log("Selected user ID:", selectedUser.id);
      if (selectedUser.id === currentUser.id) {
        console.warn("Cannot start conversation with yourself");
        return;
      }

      const result = await getOrCreateConversation(selectedUser.id);
      if (!result.success) {
        console.error("Failed to create conversation:", result.error);
        return;
      }

      router.push({
        pathname: "/(main)/chat/[conversationId]",
        params: {
          conversationId: result.data.id,
          otherUserId: selectedUser.id,
          otherUserName: selectedUser.name,
        },
      });
    } catch (error) {
      console.error("Error in handleUserPress:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Icon name="users" size={48} color={theme.colors.gray} />
          <Text style={styles.emptyStateText}>No users found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={() => handleUserPress(item)}
            currentUserId={currentUser?.id}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a User to Message</Text>
          <Text style={styles.subtitle}>
            Current User ID: {currentUser?.id}
          </Text>
        </View>
        {renderContent()}
      </View>
    </ScreenWrapper>
  );
};

export default UserList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(4),
  },
  list: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  userCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userCardPressed: {
    opacity: 0.7,
  },
  userCardContent: {
    padding: wp(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    marginRight: wp(3),
  },
  userTextContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  userName: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  userBio: {
    fontSize: hp(1.8),
    color: theme.colors.gray,
    lineHeight: hp(2.2),
  },
  chevron: {
    marginLeft: wp(2),
  },
  errorText: {
    fontSize: hp(2),
    color: theme.colors.rose,
    textAlign: "center",
    marginTop: hp(1),
  },
  emptyStateText: {
    fontSize: hp(2),
    color: theme.colors.gray,
    textAlign: "center",
    marginTop: hp(1),
  },
});
