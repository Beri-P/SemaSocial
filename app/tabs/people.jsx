// /app/tabs/people.jsx
import React, { useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useRouter } from "expo-router";
import Icon from "../../assets/icons";
import { hp, wp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const People = () => {
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Followers");
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: userProfile, error: userError } = await supabase
          .from("profiles")
          .select("followers, following")
          .eq("id", loggedInUser.id)
          .single();

        if (userError) throw userError;

        // Fetch followers
        if (userProfile.followers && userProfile.followers.length > 0) {
          const { data: followersData, error: followersError } = await supabase
            .from("profiles")
            .select("id, name, image")
            .in("id", userProfile.followers);

          if (followersError) throw followersError;

          setFollowersList(followersData);
          setFollowersCount(followersData.length);
        }

        // Fetch following
        if (userProfile.following && userProfile.following.length > 0) {
          const { data: followingData, error: followingError } = await supabase
            .from("profiles")
            .select("id, name, image")
            .in("id", userProfile.following);

          if (followingError) throw followingError;

          setFollowingList(followingData);
          setFollowingCount(followingData.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "There was an issue fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser.id]);

  const handleUnfollow = async (userId) => {
    try {
      const { data: loggedInUserProfile, error: loggedInUserError } =
        await supabase
          .from("profiles")
          .select("following")
          .eq("id", loggedInUser.id)
          .single();

      const { data: profileOwner, error: ownerError } = await supabase
        .from("profiles")
        .select("followers")
        .eq("id", userId)
        .single();

      if (loggedInUserError || ownerError)
        throw new Error("Error fetching profiles");

      // Update followers and following arrays
      const updatedFollowers = profileOwner.followers.filter(
        (id) => id !== loggedInUser.id
      );
      const updatedFollowing = loggedInUserProfile.following.filter(
        (id) => id !== userId
      );

      const { error: updateError } = await supabase.from("profiles").upsert([
        { id: userId, followers: updatedFollowers },
        { id: loggedInUser.id, following: updatedFollowing },
      ]);

      if (updateError) throw new Error("Error updating profiles");

      // Update state
      setFollowersList((prev) => prev.filter((user) => user.id !== userId));
      setFollowingList((prev) => prev.filter((user) => user.id !== userId));
      setFollowersCount((prev) => prev - 1);
      setFollowingCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "There was an issue updating the follow status.");
    }
  };

  const renderUserList = (data) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Avatar uri={item.image} size={40} />
            <Text style={styles.userName}>{item.name}</Text>
            {item.id !== loggedInUser.id && (
              <Pressable onPress={() => handleUnfollow(item.id)}>
                <Text style={styles.unfollowText}>Unfollow</Text>
              </Pressable>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    switch (activeTab) {
      case "Followers":
        return (
          <View>
            <Text style={styles.tabContent}>Followers ({followersCount})</Text>
            {renderUserList(followersList)}
          </View>
        );
      case "Following":
        return (
          <View>
            <Text style={styles.tabContent}>Following ({followingCount})</Text>
            {renderUserList(followingList)}
          </View>
        );
      case "Search":
        return <Text style={styles.tabContent}>Search for People</Text>;
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <Pressable onPress={() => router.push("/messages")}>
          <Icon
            name="mail"
            size={hp(3.2)}
            strokeWidth={2}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "Followers" && styles.activeTab]}
          onPress={() => setActiveTab("Followers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Followers" && styles.activeTabText,
            ]}
          >
            Followers
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "Search" && styles.activeTab]}
          onPress={() => setActiveTab("Search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Search" && styles.activeTabText,
            ]}
          >
            Search
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "Following" && styles.activeTab]}
          onPress={() => setActiveTab("Following")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Following" && styles.activeTabText,
            ]}
          >
            Following
          </Text>
        </Pressable>
      </View>

      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </ScreenWrapper>
  );
};

export default People;

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
    justifyContent: "flex-start",
  },
  tabContent: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    color: theme.colors.text,
    marginVertical: 10,
  },
  loadingText: {
    fontSize: hp(2),
    color: theme.colors.gray,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Reduced padding for a cleaner look
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
    paddingHorizontal: wp(4), // Add horizontal padding to match the screen design
  },
});
