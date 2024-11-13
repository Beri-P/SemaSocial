//PostCard.jsx
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHtml from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./Loading";
import { useVideo } from "../contexts/VideoContext";

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};

const PostCard = ({
  item = {}, // Default empty object for item prop
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const videoRef = useRef(null);
  const { activeVideoId, isVideoPaused, playVideo } = useVideo(); // Access video context
  const isActiveVideo = activeVideoId === item.id;

  const [likes, setLikes] = useState(item?.postLikes || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActiveVideo && !isVideoPaused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActiveVideo, isVideoPaused]);

  const handleVideoPress = () => {
    if (isActiveVideo) {
      playVideo(null); // Pause if it's already active
    } else {
      playVideo(item.id); // Set this video as active
    }
  };

  const renderMedia = () => {
    if (item.file?.type?.includes("video")) {
      return (
        <Video
          ref={videoRef}
          source={{ uri: item.file.url }}
          style={styles.postMedia}
          resizeMode="cover"
          isLooping
          shouldPlay={false}
          onTouchStart={handleVideoPress} // Control playback on touch
          useNativeControls={false}
        />
      );
    }

    /*if (item.file?.includes("postImages")) {
      return (
        <Image
          source={getSupabaseFileUrl(item.file)}
          transition={100}
          style={styles.postMedia}
          contentFit="cover"
        />
      );
    }*/

    // Return other media types if needed
    return null;
  };

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item?.postLikes]);

  const handleUserPress = () => {
    if (item.user?.id === currentUser?.id) {
      router.push("/tabs/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId: item.user.id },
      });
    }
  };

  const openPostDetails = () => {
    if (!showMoreIcon) return;
    if (item.id) {
      router.push({ pathname: "postDetails", params: { postId: item.id } });
    } else {
      console.warn("Post ID is missing");
    }
  };

  const onLike = async () => {
    if (liked) {
      let updatedLikes = likes.filter((like) => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    }
  };

  const onShare = async () => {
    try {
      let content = { message: stripHtmlTags(item?.body || "") };
      if (item?.file) {
        setLoading(true);
        let url = await downloadFile(getSupabaseFileUrl(item.file).uri);
        setLoading(false);
        content.url = url;
      }
      await Share.share(content);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handlePostDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        onPress: () => console.log("modal cancelled"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ]);
  };

  const createdAt = moment(item?.created_at).format("MMM D");
  const liked = likes.some((like) => like.userId === currentUser?.id);

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={handleUserPress}
            style={styles.userInfoContent}
          >
            <Avatar
              size={hp(4.5)}
              uri={item?.user?.image}
              rounded={theme.radius.md}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>
                {item?.user?.name || "Unknown User"}
              </Text>
              <Text style={styles.postTime}>{createdAt}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body ? (
            <RenderHtml
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          ) : null}
          {renderMedia()}
        </View>

        {item?.file && item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              size={24}
              fill={liked ? theme.colors.rose : "transparent"}
              color={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments?.[0]?.count || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.memo(PostCard);

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userTextContainer: {
    gap: 2,
  },
  username: {
    fontSize: hp("1.7"),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp("1.4"),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp("1.8"),
  },
});
