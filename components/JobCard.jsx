// components/JobCard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar";
import Icon from "../assets/icons";
import { getSupabaseFileUrl } from "../services/imageService";
import { Image } from "expo-image";
import { Video } from "expo-av";
import moment from "moment";
import Loading from "./Loading";
import { createJobLike, removeJobLike } from "../services/jobService";
import defaultUserImage from "../assets/images/defaultUser.png";

const JobCard = ({
  job = {},
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const [likes, setLikes] = useState(job?.jobLikes || []);
  const [loading, setLoading] = useState(false);

  const username = job?.user?.name || "Unknown User";
  const userImage = job?.user?.image || defaultUserImage;

  useEffect(() => {
    setLikes(job?.jobLikes || []);
  }, [job?.jobLikes]);

  const liked = likes.some((like) => like.userId === currentUser?.id);

  const onLike = useCallback(async () => {
    if (liked) {
      let updatedLikes = likes.filter(
        (like) => like.userId !== currentUser?.id
      );
      setLikes([...updatedLikes]);
      let res = await removeJobLike(job?.id, currentUser?.id);
      if (!res.success) {
        Alert.alert("Job", "Something went wrong while removing the like!");
      }
    } else {
      let data = { userId: currentUser?.id, jobId: job?.id };
      setLikes([...likes, data]);
      let res = await createJobLike(data);
      if (!res.success) {
        Alert.alert("Job", "Something went wrong while liking the job!");
      }
    }
  }, [liked, likes, job, currentUser]);

  const onShare = async () => {
    try {
      let content = { message: job?.title || "Check out this job!" };
      if (job?.file) {
        setLoading(true);
        let url = await getSupabaseFileUrl(job.file);
        setLoading(false);
        content.url = url;
      }
      await Share.share(content);
    } catch (error) {
      Alert.alert("Error", "Unable to share the job right now.");
      console.error("Error sharing job:", error);
    }
  };

  const openJobDetails = () => {
    if (showMoreIcon && job?.id) {
      router.push({ pathname: "jobDetails", params: { jobId: job.id } });
    }
  };

  const handleJobDelete = () => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => onDelete(job), style: "destructive" },
    ]);
  };

  const createdAt = moment(job?.created_at).format("MMM D");

  return (
    <View style={[styles.container, hasShadow && styles.shadow]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "tabs/profile",
                params: { userId: job?.user?.id },
              })
            }
          >
            <View style={styles.userInfo}>
              <Avatar
                size={hp(4.5)}
                uri={userImage}
                rounded={theme.radius.md}
              />
              <View>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.jobTime}>{createdAt}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {showMoreIcon && (
          <TouchableOpacity onPress={openJobDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(2.8)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id === job?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(job)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleJobDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.jobTitle}>{job?.title || "No Title"}</Text>
        <Text style={styles.jobDescription}>{job?.shortDescription}</Text>

        {job?.file && job?.file?.includes("jobImages") && (
          <Image
            source={getSupabaseFileUrl(job?.file)}
            style={styles.jobMedia}
          />
        )}

        {job?.file && job?.file?.includes("jobVideos") && (
          <Video
            style={styles.jobMedia}
            source={getSupabaseFileUrl(job?.file)}
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
              size={22}
              fill={liked ? theme.colors.rose : "transparent"}
              color={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes.length || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openJobDetails}>
            <Icon name="comment" size={22} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{job?.comments?.length || 0}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={22} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default JobCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    padding: 15, // increased padding for better layout
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
  },
  shadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensure alignment
  },
  userInfo: {
    flexDirection: "row",
    gap: 8,
  },
  username: {
    fontSize: hp(1.9), // Slightly larger font
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
  },
  jobTime: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  content: {
    gap: 10,
  },
  jobTitle: {
    fontSize: hp(2.4), // larger font for title
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  jobDescription: {
    fontSize: hp(1.7), // smaller for description
    color: theme.colors.textLight,
  },
  jobMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    paddingVertical: 10, // Increased padding for better visual spacing
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  count: {
    color: theme.colors.textLight,
    fontSize: hp(1.6),
  },
  actions: {
    flexDirection: "row",
    gap: 18,
  },
});
