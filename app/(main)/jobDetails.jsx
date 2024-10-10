// jobDetails.jsx
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  fetchJobDetails,
  createJobComment,
  removeJobComment,
  removeJob,
} from "../../services/jobService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import JobCard from "../../components/JobCard";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import { getUserData } from "../../services/userService";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../services/notificationService";

const JobDetails = () => {
  const { jobId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);

  const handleNewComment = async (payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setJob((prevJob) => {
        return {
          ...prevJob,
          comments: [newComment, ...prevJob.comments],
        };
      });
    }
  };

  useEffect(() => {
    let commentChannel = supabase
      .channel("job_comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_comments",
          filter: `jobId=eq.${jobId}`,
        },
        handleNewComment
      )
      .subscribe();

    getJobDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getJobDetails = async () => {
    // Fetch job details here
    let res = await fetchJobDetails(jobId);
    if (res.success) setJob(res.data);
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current) return null;
    let data = {
      userId: user?.id,
      jobId: job?.id,
      text: commentRef.current,
    };
    // Create job comment
    setLoading(true);
    let res = await createJobComment(data);
    setLoading(false);
    if (res.success) {
      if (user.id != job.userId) {
        // Send notification
        let notify = {
          senderId: user.id,
          receiverId: job.userId,
          title: "commented on your job post",
          data: JSON.stringify({ jobId: job.id, commentId: res?.data?.id }),
        };
        createNotification(notify);
      }
      inputRef?.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeleteComment = async (comment) => {
    // Deleting comment
    let res = await removeJobComment(comment?.id);
    if (res.success) {
      setJob((prevJob) => {
        let updatedJob = { ...prevJob };
        updatedJob.comments = updatedJob.comments.filter(
          (c) => c.id !== comment.id
        );
        return updatedJob;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeleteJob = async (item) => {
    // Delete job here
    let res = await removeJob(job.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Job", res.msg);
    }
  };

  const onEditJob = async (item) => {
    router.back();
    router.push({ pathname: "newJob", params: { ...item } });
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!job) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Job not found!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <JobCard
          job={{ ...job, comments: [{ count: job?.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeleteJob}
          onEdit={onEditJob}
        />
        {/* Comment input */}
        <View style={styles.inputContainer}>
          <Input
            inputRef={inputRef}
            placeholder="Type comment..."
            onChangeText={(value) => (commentRef.current = value)}
            placeholderTextColor={theme.colors.textLight}
            containerStyle={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
          />

          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* Comment list */}
        <View style={{ marginVertical: 15, gap: 17 }}>
          {job?.comments?.map((comment) => (
            <CommentItem
              key={comment?.id?.toString()}
              item={comment}
              onDelete={onDeleteComment}
              highlight={comment.id == commentId}
              canDelete={user.id == comment.userId}
            />
          ))}

          {job?.comments?.length === 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default JobDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
