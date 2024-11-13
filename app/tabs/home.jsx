// /app/tabs/home.jsx
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { RefreshControl } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useVideo } from "../../contexts/VideoContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/userService";

const POSTS_PER_PAGE = 10;
const INITIAL_STATE = {
  posts: [],
  hasMore: true,
  notificationCount: 0,
  limit: 0,
};

// Separate Header component for better performance
const Header = React.memo(
  ({ notificationCount, onNotificationPress, onNewPostPress }) => (
    <View style={styles.header}>
      <Text style={styles.title}>SemaSocial</Text>
      <View style={styles.icons}>
        <Pressable onPress={onNotificationPress}>
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
        <Pressable onPress={onNewPostPress}>
          <Icon
            name="plus"
            size={hp(3.2)}
            strokeWidth={2}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  )
);

// Optimized Post component
const MemoizedPostCard = React.memo(PostCard);

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { pauseVideo } = useVideo();
  const [state, setState] = useState(INITIAL_STATE);
  const [refreshing, setRefreshing] = useState(false);
  const { posts, hasMore, notificationCount, limit } = state;
  const flatListRef = useRef(null);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setState((prev) => ({ ...prev, limit: 0 }));
    await getPosts(true);
    setRefreshing(false);
  }, []);

  const getPosts = useCallback(
    async (isRefreshing = false) => {
      if (!hasMore && !isRefreshing) return;

      const newLimit = isRefreshing ? POSTS_PER_PAGE : limit + POSTS_PER_PAGE;

      try {
        const res = await fetchPosts(newLimit);
        if (res.success) {
          const uniquePosts = [
            ...new Map(
              (isRefreshing ? res.data : [...state.posts, ...res.data]).map(
                (post) => [post.id, post]
              )
            ).values(),
          ];

          setState((prev) => ({
            ...prev,
            posts: uniquePosts,
            hasMore: res.data.length === POSTS_PER_PAGE, // Set to false if fewer posts are fetched
            limit: newLimit,
          }));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    },
    [hasMore, limit, state.posts]
  );

  // Visibility change handler for videos
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      viewableItems.forEach(({ item, isViewable }) => {
        if (!isViewable && item.file?.type?.includes("video")) {
          pauseVideo();
        }
      });
    },
    [pauseVideo]
  );

  // Memoized event handlers
  const handleLoadMore = useCallback(async () => {
    if (!hasMore) return;

    try {
      const res = await fetchPosts(limit + POSTS_PER_PAGE);
      if (res.success) {
        const uniquePosts = [
          ...new Map(
            [...state.posts, ...res.data].map((post) => [post.id, post])
          ).values(),
        ];

        setState((prev) => ({
          ...prev,
          posts: uniquePosts,
          hasMore: res.data.length === POSTS_PER_PAGE, // Set to false if fewer posts are fetched
          limit: prev.limit + POSTS_PER_PAGE,
        }));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [hasMore, limit, state.posts]);

  const handlePostEvent = useCallback(async (payload) => {
    const { eventType, new: newData, old: oldData } = payload;

    setState((prevState) => {
      const { posts: prevPosts } = prevState;

      switch (eventType) {
        case "INSERT": {
          if (!newData?.id) return prevState;
          const newPost = {
            ...newData,
            postLikes: [],
            // Modify this line to ensure unique comment ID
            comments: [{ id: `initial-${newData.id}`, count: 0 }],
            user: {}, // Will be updated after getUserData
          };

          // Get user data asynchronously
          getUserData(newData.userId).then((res) => {
            if (res.success) {
              setState((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                  post.id === newData.id ? { ...post, user: res.data } : post
                ),
              }));
            }
          });

          return {
            ...prevState,
            posts: [newPost, ...prevPosts],
          };
        }

        case "DELETE": {
          if (!oldData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.filter((post) => post.id !== oldData.id),
          };
        }

        case "UPDATE": {
          if (!newData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              post.id === newData.id
                ? { ...post, body: newData.body, file: newData.file }
                : post
            ),
          };
        }

        default:
          return prevState;
      }
    });
  }, []);

  const handleNewNotification = useCallback((payload) => {
    if (payload.eventType === "INSERT" && payload.new.id) {
      setState((prev) => ({
        ...prev,
        notificationCount: prev.notificationCount + 1,
      }));
    }
  }, []);

  const handleCommentEvent = useCallback((payload) => {
    const { eventType, new: newData, old: oldData } = payload;

    setState((prevState) => {
      const { posts: prevPosts } = prevState;

      const updatePost = (post, postId, updateFn) =>
        post.id === postId ? updateFn(post) : post;

      switch (eventType) {
        case "INSERT":
          if (!newData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              updatePost(post, newData.postId, (p) => ({
                ...p,
                comments: p.comments.filter((c) => c.id !== `initial-${p.id}`), // Remove initial placeholder
                comments: [
                  ...p.comments,
                  { ...newData, id: `comment-${newData.id}` },
                ],
              }))
            ),
          };

        case "DELETE":
          if (!oldData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              updatePost(post, oldData.postId, (p) => ({
                ...p,
                comments: p.comments.filter(
                  (comment) =>
                    comment.id !== oldData.id &&
                    comment.id !== `comment-${oldData.id}`
                ),
              }))
            ),
          };

        case "UPDATE":
          if (!newData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              updatePost(post, newData.postId, (p) => ({
                ...p,
                comments: p.comments.map((comment) =>
                  comment.id === `comment-${newData.id}` ||
                  comment.id === newData.id
                    ? { ...newData, id: `comment-${newData.id}` }
                    : comment
                ),
              }))
            ),
          };

        default:
          return prevState;
      }
    });
  }, []);

  const handleLikeEvent = useCallback((payload) => {
    const { eventType, new: newData, old: oldData } = payload;

    setState((prevState) => {
      const { posts: prevPosts } = prevState;

      switch (eventType) {
        case "INSERT":
          if (!newData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              post.id === newData.postId
                ? { ...post, postLikes: [...post.postLikes, newData] }
                : post
            ),
          };

        case "DELETE":
          if (!oldData?.id) return prevState;
          return {
            ...prevState,
            posts: prevPosts.map((post) =>
              post.id === oldData.postId
                ? {
                    ...post,
                    postLikes: post.postLikes.filter(
                      (like) => like.id !== oldData.id
                    ),
                  }
                : post
            ),
          };

        default:
          return prevState;
      }
    });
  }, []);

  // Setup Supabase channels
  useEffect(() => {
    const channels = [
      {
        name: "posts",
        config: {
          event: "*",
          schema: "public",
          table: "posts",
        },
        handler: handlePostEvent,
      },
      {
        name: "notifications",
        config: {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        handler: handleNewNotification,
      },
      {
        name: "comments",
        config: {
          event: "*",
          schema: "public",
          table: "comments",
        },
        handler: handleCommentEvent,
      },
      {
        name: "likes",
        config: {
          event: "*",
          schema: "public",
          table: "likes",
        },
        handler: handleLikeEvent,
      },
    ];

    const activeChannels = channels.map((channel) =>
      supabase
        .channel(channel.name)
        .on("postgres_changes", channel.config, channel.handler)
        .subscribe()
    );

    return () => {
      activeChannels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [
    user.id,
    handlePostEvent,
    handleNewNotification,
    handleCommentEvent,
    handleLikeEvent,
  ]);

  // Memoized render functions
  const renderPost = useCallback(
    ({ item, index }) => (
      <MemoizedPostCard
        item={item}
        currentUser={user}
        router={router}
        index={index}
      />
    ),
    [user, router]
  );

  const keyExtractor = useCallback((item, index) => {
    const key = item?.id ? `post-${item.id}` : `index-${index}-${Date.now()}`;
    console.log("Generated key:", key); // Debugging log
    return key;
  }, []);

  const renderFooter = useCallback(() => {
    if (posts.length === 0) {
      return null;
    }

    if (!hasMore) {
      return (
        <View style={{ marginVertical: 30 }}>
          <Text style={styles.noPosts}>No more posts</Text>
        </View>
      );
    }

    return (
      <View style={{ marginVertical: 30 }}>
        <Loading />
      </View>
    );
  }, [hasMore, posts.length]);

  const handleNotificationPress = useCallback(() => {
    setState((prev) => ({ ...prev, notificationCount: 0 }));
    router.push("(main)/notifications");
  }, [router]);

  const handleNewPostPress = useCallback(() => {
    router.push("(main)/newPost");
  }, [router]);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header
          notificationCount={notificationCount}
          onNotificationPress={handleNotificationPress}
          onNewPostPress={handleNewPostPress}
        />
        <FlatList
          ref={flatListRef}
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={keyExtractor}
          renderItem={renderPost}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          viewabilityConfig={viewabilityConfig.current}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
