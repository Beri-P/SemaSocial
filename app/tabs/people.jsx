//tabs/people.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useRouter } from "expo-router";
import Icon from "../../assets/icons";
import { hp, wp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const TABS = {
  FOLLOWERS: "Followers",
  FOLLOWING: "Following",
  SEARCH: "Search",
};

const UserListItem = ({ user, isCurrentUser, onUnfollow }) => (
  <View style={styles.userRow}>
    <Avatar uri={user.image} size={40} />
    <Text style={styles.userName}>{user.name}</Text>
    {!isCurrentUser && (
      <Pressable
        onPress={() => onUnfollow(user.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.unfollowText}>Unfollow</Text>
      </Pressable>
    )}
  </View>
);

const TabButton = ({ title, isActive, onPress }) => (
  <Pressable
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </Pressable>
);

const People = () => {
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.FOLLOWERS);
  const [userData, setUserData] = useState({
    followers: { list: [], count: 0 },
    following: { list: [], count: 0 },
  });
  const [loading, setLoading] = useState(true);

  const fetchUserConnections = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("followers, following")
        .eq("id", loggedInUser.id)
        .single();

      if (userError) throw userError;

      const connections = { followers: [], following: [] };

      if (userProfile.followers?.length) {
        const { data: followersData } = await supabase
          .from("profiles")
          .select("id, name, image")
          .in("id", userProfile.followers);
        connections.followers = followersData || [];
      }

      if (userProfile.following?.length) {
        const { data: followingData } = await supabase
          .from("profiles")
          .select("id, name, image")
          .in("id", userProfile.following);
        connections.following = followingData || [];
      }

      setUserData({
        followers: {
          list: connections.followers,
          count: connections.followers.length,
        },
        following: {
          list: connections.following,
          count: connections.following.length,
        },
      });
    } catch (error) {
      console.error("Error fetching connections:", error);
      Alert.alert("Error", "Failed to load user connections.");
    } finally {
      setLoading(false);
    }
  }, [loggedInUser.id]);

  useEffect(() => {
    fetchUserConnections();
  }, [fetchUserConnections]);

  const handleUnfollow = async (userId) => {
    try {
      const { data: profiles, error: fetchError } = await supabase
        .from("profiles")
        .select("id, followers, following")
        .in("id", [loggedInUser.id, userId]);

      if (fetchError) throw fetchError;

      const [loggedInUserProfile, targetUserProfile] = profiles;

      const updates = [
        {
          id: userId,
          followers: targetUserProfile.followers.filter(
            (id) => id !== loggedInUser.id
          ),
        },
        {
          id: loggedInUser.id,
          following: loggedInUserProfile.following.filter(
            (id) => id !== userId
          ),
        },
      ];

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (updateError) throw updateError;

      await fetchUserConnections();
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "Failed to unfollow user.");
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

    const currentData =
      activeTab === TABS.FOLLOWERS ? userData.followers : userData.following;

    if (activeTab === TABS.SEARCH) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.tabContent}>
            Search functionality coming soon
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.tabContent}>
          {activeTab} ({currentData.count})
        </Text>
        <FlatList
          data={currentData.list}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              isCurrentUser={item.id === loggedInUser.id}
              onUnfollow={handleUnfollow}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <Pressable
          onPress={() => router.push("/messages")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="mail"
            size={hp(3.2)}
            strokeWidth={2}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {Object.values(TABS).map((tab) => (
          <TabButton
            key={tab}
            title={tab}
            isActive={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </View>

      {renderContent()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.grayLight,
    paddingBottom: 10,
    paddingHorizontal: wp(2),
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: wp(4),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: hp(2),
    color: theme.colors.gray,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.bold,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    color: theme.colors.text,
    marginVertical: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: theme.colors.white,
    borderRadius: 5,
    width: "100%",
  },
  userName: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
    marginLeft: 10,
  },
  unfollowText: {
    color: theme.colors.primary,
    fontSize: hp(2),
    fontWeight: "bold",
  },
  list: {
    flexGrow: 1,
  },
});

export default People;
