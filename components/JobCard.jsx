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
      router.push({ pathname: "jobDetails", params: { jobId: job.id } });
    }
  };

  const timeAgo = moment(job?.created_at).fromNow();

  return (
    <TouchableOpacity onPress={openJobDetails} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.jobTitle}>{job?.title || "No Title"}</Text>

        <View style={styles.companyInfo}>
          <Icon name="building" size={16} color={theme.colors.textLight} />
          <Text style={styles.companyText}>
            {job?.company || "Unknown Company"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="clock" size={16} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {job?.experience || "Not specified"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="mapPin" size={16} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {job?.location || "Location not specified"}
            </Text>
          </View>
        </View>

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
