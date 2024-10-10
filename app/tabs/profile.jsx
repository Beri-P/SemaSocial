// profile.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import { getProfileById } from "../../services/userService";
import Loading from "../../components/Loading";
import PostCard from "../../components/PostCard";
import { supabase } from "../../lib/supabase";

const Profile = () => {
  const { user: loggedInUser } = useAuth();
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [offset, setOffset] = useState(0);

  // Load user data (profile)
  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      let profile = loggedInUser;
      if (userId && userId !== loggedInUser.id) {
        const res = await getProfileById(userId);
        if (res.success) {
          profile = res.data;
        } else {
          Alert.alert("Error", "Unable to fetch user data.");
        }
      }
      setProfileUser(profile);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Unable to load user data.");
    } finally {
      setLoading(false);
    }
  }, [userId, loggedInUser]);

  // Load posts for the profile user
  const loadPosts = useCallback(async () => {
    if (!profileUser || loadingPosts || !hasMore) return;

    setLoadingPosts(true);
    try {
      const res = await fetchPosts(10, offset, profileUser.id);
      if (res.success) {
        const newPosts = res.data.filter(
          (newPost) => !posts.some((post) => post.id === newPost.id)
        );
        if (newPosts.length > 0) {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setOffset((prevOffset) => prevOffset + newPosts.length);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
        console.error("Error fetching posts:", res.msg);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Could not fetch posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, [profileUser, hasMore, loadingPosts, offset, posts]);

  // Fetch user data when the userId changes
  useEffect(() => {
    if (userId) {
      loadUserData();
      // Reset posts when a new profile user is loaded
      setPosts([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [userId, loadUserData]);

  // Fetch posts when profileUser or offset changes
  useEffect(() => {
    if (profileUser) {
      loadPosts();
    }
  }, [profileUser, offset, loadPosts]);

  // Handle loading more posts when scrolling to the end
  const handleEndReached = () => {
    if (hasMore && !loadingPosts) {
      loadPosts();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Sign out", "Error signing out!");
          }
        },
      },
    ]);
  };

  if (loading || !profileUser) {
    return <Loading />;
  }

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            profileUser={profileUser}
            setProfileUser={setProfileUser}
            loggedInUser={loggedInUser}
            userId={userId}
            router={router}
            handleLogout={handleLogout}
          />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          item ? (
            <PostCard item={item} currentUser={loggedInUser} router={router} />
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({
  profileUser,
  setProfileUser,
  loggedInUser,
  userId,
  router,
  handleLogout,
}) => {
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const isFollowing = profileUser?.followers?.includes(loggedInUser.id);

  useEffect(() => {
    if (userId) {
      const channel = supabase
        .channel("any")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new) {
              setProfileUser((prevProfileUser) => ({
                ...prevProfileUser,
                followers: payload.new.followers,
                following: payload.new.following,
              }));
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [userId]);

  useEffect(() => {
    const fetchFollowersAndFollowing = async () => {
      try {
        const { data: profileOwner, error } = await supabase
          .from("profiles")
          .select("followers, following")
          .eq("id", profileUser.id)
          .single();

        if (error) throw error;

        const { data: followers, error: followersError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileOwner.followers);

        const { data: following, error: followingError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileOwner.following);

        if (followersError || followingError)
          throw new Error("Error fetching users");

        setFollowersList(followers);
        setFollowingList(following);
      } catch (error) {
        console.error("Error fetching followers and following:", error);
      }
    };

    fetchFollowersAndFollowing();
  }, [profileUser.id]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: profileOwner, error } = await supabase
          .from("profiles")
          .select("followers, following")
          .eq("id", profileUser.id)
          .single();

        if (error) throw error;

        setProfileUser((prevProfileUser) => ({
          ...prevProfileUser,
          followers: profileOwner.followers,
          following: profileOwner.following,
        }));
      } catch (error) {
        console.error("Error fetching follower/following counts:", error);
      }
    };

    if (profileUser && profileUser.id) {
      fetchCounts();
    }
  }, [profileUser, setProfileUser]);

  const handleFollowToggle = async () => {
    try {
      const profileOwnerId = profileUser.id;
      const loggedInUserId = loggedInUser.id;

      const { data: profileOwner, error: ownerError } = await supabase
        .from("profiles")
        .select("followers")
        .eq("id", profileOwnerId)
        .single();

      const { data: loggedInUserProfile, error: loggedInUserError } =
        await supabase
          .from("profiles")
          .select("following")
          .eq("id", loggedInUserId)
          .single();

      if (ownerError || loggedInUserError)
        throw new Error("Error fetching profiles");

      const isCurrentlyFollowing =
        profileOwner.followers.includes(loggedInUserId);

      let updatedFollowers, updatedFollowing;

      if (isCurrentlyFollowing) {
        updatedFollowers = profileOwner.followers.filter(
          (id) => id !== loggedInUserId
        );
        updatedFollowing = loggedInUserProfile.following.filter(
          (id) => id !== profileOwnerId
        );
      } else {
        updatedFollowers = [...(profileOwner.followers || []), loggedInUserId];
        updatedFollowing = [
          ...(loggedInUserProfile.following || []),
          profileOwnerId,
        ];
      }

      const { error: updateError } = await supabase.from("profiles").upsert([
        { id: profileOwnerId, followers: updatedFollowers },
        { id: loggedInUserId, following: updatedFollowing },
      ]);

      if (updateError) throw new Error("Error updating profiles");

      setProfileUser((prevProfileUser) => ({
        ...prevProfileUser,
        followers: updatedFollowers,
      }));
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "There was an issue updating the follow status.");
    }
  };

  const handleMessage = () => {
    Alert.alert("Message", `You are sending a message to ${profileUser.name}!`);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
        {profileUser.id === loggedInUser.id ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" color={theme.colors.rose} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View className={styles.avatarContainer}>
            <Avatar
              uri={profileUser?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            {profileUser.id === loggedInUser.id ? (
              <Pressable
                style={styles.editIcon}
                onPress={() => router.push("editProfile")}
              >
                <Icon name="edit" strokeWidth={2.5} color={theme.colors.rose} />
              </Pressable>
            ) : null}
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.username}>
              {profileUser && profileUser.name}
            </Text>
            <Text style={styles.infoText}>
              {profileUser && profileUser.address}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>
                {profileUser && profileUser.email}
              </Text>
            </View>
            {profileUser.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{profileUser.phoneNumber}</Text>
              </View>
            )}
            {profileUser.bio && (
              <Text style={styles.infoText}>{profileUser.bio}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profileUser?.followers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profileUser?.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {profileUser.id !== loggedInUser.id ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  {
                    backgroundColor: isFollowing
                      ? theme.colors.primary
                      : theme.colors.primary,
                  },
                ]}
                onPress={handleFollowToggle}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  statBox: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  followButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  followButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  messageButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
