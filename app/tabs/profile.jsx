// profile.jsx
import React, { useEffect, useState, useCallback } from "react";
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
import { useRouter } from "expo-router";
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

const Profile = ({ userId = null }) => {
  const { user: loggedInUser } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [offset, setOffset] = useState(0);

  // Reset all states when userId changes
  const resetStates = useCallback(() => {
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);
    setLoadingPosts(false);
    setProfileUser(null);
  }, []);

  // Load user data (profile)
  const loadUserData = useCallback(async () => {
    try {
      let profile;
      // If no userId is provided or if userId matches logged in user, show logged in user's profile
      if (!userId || userId === loggedInUser.id) {
        profile = loggedInUser;
      } else {
        const res = await getProfileById(userId);
        if (res.success) {
          profile = res.data;
        } else {
          Alert.alert("Error", "Unable to fetch user data.");
          return;
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

  // Reset state and load new data when userId changes
  useEffect(() => {
    resetStates();
    loadUserData();

    // Cleanup function
    return () => {
      resetStates();
    };
  }, [userId, loggedInUser.id, resetStates, loadUserData]);

  // Load posts for the profile user
  const loadPosts = useCallback(async () => {
    if (!profileUser?.id || loadingPosts || !hasMore) return;

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
  }, [profileUser?.id, hasMore, loadingPosts, offset, posts]);

  // Fetch posts when profileUser changes
  useEffect(() => {
    if (profileUser?.id) {
      // Reset posts state when profile changes
      setPosts([]);
      setOffset(0);
      setHasMore(true);
      loadPosts();
    }
  }, [profileUser?.id]);

  // Handle loading more posts when scrolling to the end
  const handleEndReached = () => {
    if (hasMore && !loadingPosts) {
      loadPosts();
    }
  };

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

  // Check if we're viewing our own profile
  const isOwnProfile = !userId || userId === loggedInUser.id;

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            profileUser={profileUser}
            setProfileUser={setProfileUser}
            loggedInUser={loggedInUser}
            isOwnProfile={isOwnProfile}
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
          loadingPosts ? (
            <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : !hasMore && posts.length > 0 ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loadingPosts ? (
            <View style={{ marginVertical: 100 }}>
              <Text style={styles.noPosts}>No posts yet</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({
  profileUser,
  setProfileUser,
  loggedInUser,
  isOwnProfile,
  router,
  handleLogout,
}) => {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const isFollowing = profileUser?.followers?.includes(loggedInUser.id);

  useEffect(() => {
    const fetchFollowCounts = async () => {
      if (!profileUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("followers, following")
          .eq("id", profileUser.id)
          .single();

        if (error) throw error;

        // Ensure followers and following are arrays, defaulting to empty arrays if null
        const followers = Array.isArray(profile.followers)
          ? profile.followers
          : [];
        const following = Array.isArray(profile.following)
          ? profile.following
          : [];

        setFollowerCount(followers.length);
        setFollowingCount(following.length);

        // Update the profileUser state with the correct arrays
        setProfileUser((prev) => ({
          ...prev,
          followers: followers,
          following: following,
        }));

        // Fetch detailed followers information
        const { data: followersData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", followers);

        // Fetch detailed following information
        const { data: followingData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", following);

        setFollowersList(followersData || []);
        setFollowingList(followingData || []);
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      }
    };

    fetchFollowCounts();
  }, [profileUser?.id]);

  useEffect(() => {
    if (profileUser?.id) {
      const channel = supabase
        .channel(`profile-${profileUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${profileUser.id}`,
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
  }, [profileUser?.id, setProfileUser]);

  useEffect(() => {
    if (profileUser?.id) {
      const channel = supabase
        .channel(`profile-${profileUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${profileUser.id}`,
          },
          (payload) => {
            if (payload.new) {
              const newFollowers = Array.isArray(payload.new.followers)
                ? payload.new.followers
                : [];
              const newFollowing = Array.isArray(payload.new.following)
                ? payload.new.following
                : [];

              setFollowerCount(newFollowers.length);
              setFollowingCount(newFollowing.length);

              setProfileUser((prev) => ({
                ...prev,
                followers: newFollowers,
                following: newFollowing,
              }));
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [profileUser?.id]);

  const handleFollowToggle = async () => {
    try {
      const profileOwnerId = profileUser.id;
      const loggedInUserId = loggedInUser.id;
  
      // First fetch both profiles
      const { data: ownerProfile, error: ownerError } = await supabase
        .from("profiles")
        .select("followers")
        .eq("id", profileOwnerId)
        .single();
  
      if (ownerError) throw new Error(`Error fetching profile owner: ${ownerError.message}`);
  
      const { data: loggedInUserProfile, error: loggedInError } = await supabase
        .from("profiles")
        .select("following")
        .eq("id", loggedInUserId)
        .single();
  
      if (loggedInError) throw new Error(`Error fetching logged in user: ${loggedInError.message}`);
  
      // Safely handle null values from database
      const currentFollowers = ownerProfile?.followers || [];
      const currentFollowing = loggedInUserProfile?.following || [];
  
      // Check if currently following
      const isCurrentlyFollowing = currentFollowers.includes(loggedInUserId);
  
      // Prepare updates
      let updatedFollowers, updatedFollowing;
  
      if (isCurrentlyFollowing) {
        // Remove from followers/following
        updatedFollowers = currentFollowers.filter(id => id !== loggedInUserId);
        updatedFollowing = currentFollowing.filter(id => id !== profileOwnerId);
      } else {
        // Add to followers/following
        updatedFollowers = [...new Set([...currentFollowers, loggedInUserId])];
        updatedFollowing = [...new Set([...currentFollowing, profileOwnerId])];
      }
  
      // Update profiles separately
      const { error: updateOwnerError } = await supabase
        .from("profiles")
        .update({
          followers: updatedFollowers,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileOwnerId);
  
      if (updateOwnerError) throw new Error(`Error updating profile owner: ${updateOwnerError.message}`);
  
      const { error: updateLoggedInError } = await supabase
        .from("profiles")
        .update({
          following: updatedFollowing,
          updated_at: new Date().toISOString()
        })
        .eq("id", loggedInUserId);
  
      if (updateLoggedInError) throw new Error(`Error updating logged in user: ${updateLoggedInError.message}`);
  
      // Update local state
      setFollowerCount(updatedFollowers.length);
      setProfileUser(prev => ({
        ...prev,
        followers: updatedFollowers,
      }));
  
    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert(
        "Error",
        "There was an issue updating the follow status. Please try again."
      );
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
        <Header title={isOwnProfile ? "My Profile" : "Profile"} mb={30} />
        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" color={theme.colors.rose} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={profileUser?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            {isOwnProfile && (
              <Pressable
                style={styles.editIcon}
                onPress={() => router.push("editProfile")}
              >
                <Icon name="edit" strokeWidth={2.5} color={theme.colors.rose} />
              </Pressable>
            )}
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{profileUser?.name}</Text>
            <Text style={styles.infoText}>{profileUser?.address}</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{profileUser?.email}</Text>
            </View>
            {profileUser?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{profileUser.phoneNumber}</Text>
              </View>
            )}
            {profileUser?.bio && (
              <Text style={styles.infoText}>{profileUser.bio}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {!isOwnProfile && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  {
                    backgroundColor: theme.colors.primary,
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
          )}
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
