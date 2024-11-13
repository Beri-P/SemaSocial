// components/JobCard.jsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Icon from "../assets/icons";
import moment from "moment";

const JobCard = ({ job = {}, router }) => {
  const openJobDetails = () => {
    if (job?.id) {
      // Navigate to JobDetails with jobId as a parameter
      router.push({
        pathname: "/jobDetails",
        params: { jobId: job.id },
      });
    }
  };

  const timeAgo = moment(job?.created_at).fromNow();

  return (
    <TouchableOpacity onPress={openJobDetails} style={styles.container}>
      <View style={styles.content}>
        {/* Job Title */}
        <Text style={styles.jobTitle}>{job.title || "No Title"}</Text>

        {/* Company Information */}
        <View style={styles.companyInfo}>
          <Icon name="company" size={16} color={theme.colors.textLight} />
          <Text style={styles.companyText}>
            {job.companyName || "No Company Provided"}
          </Text>
        </View>

        {/* Experience and Location Information */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="experience" size={16} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {job.requiredExperience || "Experience not specified"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="location" size={16} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {job.location || "Location not specified"}
            </Text>
          </View>
        </View>

        {/* Posted Time */}
        <Text style={styles.postedTime}>Posted {timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  content: {
    padding: wp(4),
    gap: hp(1),
  },
  jobTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(1),
  },
  companyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: wp(6),
    marginBottom: hp(1),
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  infoText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  postedTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(1),
  },
});
