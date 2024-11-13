//notifications.jsx
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";

const NotificationCard = ({ item, router }) => {
  const getIcon = () => {
    switch (item.type) {
      case "like":
        return "heart";
      case "comment":
        return "message-circle";
      case "follow":
        return "user-plus";
      default:
        return "bell";
    }
  };

  const handlePress = () => {
    if (item.navigationPath) {
      router.push(item.navigationPath);
    }
  };

  return (
    <Pressable
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={handlePress}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Icon name={getIcon()} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          {item.userImage && (
            <Avatar uri={item.userImage} size={40} style={styles.avatar} />
          )}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Icon name="notification" size={48} color={theme.colors.gray} />
    <Text style={styles.emptyStateText}>No notifications yet</Text>
    <Text style={styles.emptyStateSubtext}>
      We'll notify you when something interesting happens
    </Text>
  </View>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications(user.id);
      if (res.success) {
        setNotifications(res.data);
      } else {
        setError("Could not fetch notifications");
      }
    } catch (err) {
      setError("An error occurred while fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (notifications.length === 0) {
      return <EmptyState />;
    }

    return (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item?.id?.toString()}
        renderItem={({ item }) => (
          <NotificationCard item={item} router={router} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={getNotifications}
      />
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Notifications" />
        {renderContent()}
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  notificationCard: {
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
  unreadCard: {
    backgroundColor: `${theme.colors.primary}10`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    padding: wp(4),
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  messageContainer: {
    flex: 1,
    marginLeft: wp(3),
  },
  message: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
    marginBottom: hp(0.5),
  },
  timestamp: {
    fontSize: hp(1.6),
    color: theme.colors.gray,
  },
  avatar: {
    marginRight: wp(2),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  emptyStateText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  emptyStateSubtext: {
    fontSize: hp(1.8),
    color: theme.colors.gray,
    textAlign: "center",
  },
  errorText: {
    fontSize: hp(1.8),
    color: theme.colors.rose,
    textAlign: "center",
    marginTop: hp(1),
  },
});
