// /app/tabs/home.jsx
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/userService";

var limit = 0;
const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handlePostEvent = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    if (payload.eventType === "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        let updatedPost = prevPosts.filter((post) => post.id != payload.old.id);
        return updatedPost;
      });
    }
    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body;
            (post.file = payload.new), file;
            //post.postLikes = payload.new.postLikes;
            //post.comments = payload.new.comments;
          }
          return post;
        });

        return updatedPosts;
      });
    }
  };

  const handleNewNotification = async (payload) => {
    console.log("got new notification: ", payload);
    if (payload.eventType === "INSERT" && payload.new.id) {
      setNotificationCount((prev) => prev + 1);
    }
  };

  // Function to handle new comments or updates to comments
  const handleCommentEvent = (payload) => {
    console.log("Comment change:", payload);
    if (payload.eventType === "INSERT" && payload.new.id) {
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.new.postId) {
            post.comments = [...post.comments, payload.new];
          }
          return post;
        });
      });
    }
    if (payload.eventType === "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.old.postId) {
            post.comments = post.comments.filter(
              (comment) => comment.id !== payload.old.id
            );
          }
          return post;
        });
      });
    }
    if (payload.eventType === "UPDATE" && payload.new.id) {
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.new.postId) {
            post.comments = post.comments.map((comment) =>
              comment.id === payload.new.id ? payload.new : comment
            );
          }
          return post;
        });
      });
    }
  };

  // Function to handle new likes or updates to likes
  const handleLikeEvent = (payload) => {
    console.log("Like change:", payload);
    if (payload.eventType === "INSERT" && payload.new.id) {
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.new.postId) {
            post.postLikes = [...post.postLikes, payload.new];
          }
          return post;
        });
      });
    }
    if (payload.eventType === "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post.id === payload.old.postId) {
            post.postLikes = post.postLikes.filter(
              (like) => like.id !== payload.old.id
            );
          }
          return post;
        });
      });
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    //getPosts();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    // Create a channel for comments
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        handleCommentEvent
      )
      .subscribe();

    // Check if a channel for likes already exists, if not, create it
    let likeChannel = supabase
      .channel("likes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        handleLikeEvent
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(likeChannel);
    };
  }, []);

  const getPosts = async () => {
    //call the api here

    if (!hasMore) return null;
    limit = limit + 10;

    console.log("fething post: ", limit);
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  //console.log('user: ', user);

  /*const onLogout = async ()=>{
        //setAuth(null);
        const {error} = await supabase.auth.signOut();
        if(error){
            Alert.alert('Sign out', "Error signing out!")
        }
    }*/
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SemaSocial</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                router.push("(main)/notifications");
              }}
            >
              <Icon
                name="notification"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("(main)/newPost")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            {/* <Pressable onPress={() => router.push("(main)/profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable> */}
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) =>
            item.id.toString() || Math.random().toString()
          } // Ensure a valid key
          renderItem={({ item }) =>
            item ? ( // Check if item is valid
              <PostCard item={item} currentUser={user} router={router} />
            ) : null
          }
          onEndReached={() => {
            getPosts();
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
      {/*<Button title="logout" onPress={onLogout} />*/}
    </ScreenWrapper>
  );
};

export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingHorizontal: wp(4)
  },
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
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
