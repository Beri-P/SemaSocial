// (main)/jobDetails.jsx
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchJobDetails } from "../../services/jobService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";
import Icon from "../../assets/icons";
import ScreenWrapper from "../../components/ScreenWrapper";

const JobDetails = () => {
  const { jobId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState("Job Description");

  useEffect(() => {
    getJobDetails();
  }, []);

  const getJobDetails = async () => {
    let res = await fetchJobDetails(jobId);
    if (res.success) setJob(res.data);
    setStartLoading(false);
  };

  const onEditJob = () => {
    router.back();
    router.push({ pathname: "newJob", params: { ...job } });
  };

  const handleApply = () => {
    if (job?.customUrl) {
      Linking.openURL(job.customUrl);
    } else {
      Alert.alert("Error", "No URL provided for this job.");
    }
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
      <View style={[styles.center, { marginTop: 100 }]}>
        <Text style={styles.notFound}>Job not found!</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Job Description":
        return (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Job Type:</Text>
              <Text style={styles.value}>
                {job.employmentType || "Not specified"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Salary:</Text>
              <Text style={styles.value}>{job.salary || "Not specified"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Other Pays:</Text>
              <Text style={styles.value}>
                {job.otherPays || "Not specified"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Employment Type:</Text>
              <Text style={styles.value}>
                {job.employmentType || "Not specified"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Education:</Text>
              <Text style={styles.value}>
                {job.educationLevel || "Not specified"}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Job Description</Text>
            <View style={styles.descriptionContainer}>
              {job.jobDescription ? (
                job.jobDescription.split("\n").map((item, index) => (
                  <Text key={index} style={styles.descriptionItem}>
                    • {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.descriptionItem}>
                  No job description provided.
                </Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Application Question(s):</Text>
            <View style={styles.questionsContainer}>
              {job.applicationQuestions ? (
                job.applicationQuestions.map((question, index) => (
                  <Text key={index} style={styles.question}>
                    • {question}
                  </Text>
                ))
              ) : (
                <Text style={styles.question}>
                  No specific questions provided.
                </Text>
              )}
            </View>
          </View>
        );
      case "Company Details":
        return (
          <View>
            <Text style={styles.sectionTitle}>Company Details</Text>
            <Text style={styles.value}>Name: {job.companyName || "N/A"}</Text>
            <Text style={styles.value}>Industry: {job.industry || "N/A"}</Text>
            <Text style={styles.value}>
              Website: {job.companyWebsite || "N/A"}
            </Text>
            <Text style={styles.value}>
              Description: {job.companyDescription || "N/A"}
            </Text>
          </View>
        );
      case "Contact Information":
        return (
          <View>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.value}>
              Contact Name: {job.contactName || "N/A"}
            </Text>
            <Text style={styles.value}>Email: {job.email || "N/A"}</Text>
            <Text style={styles.value}>Phone: {job.phone || "N/A"}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{job.title}</Text>
            <View style={styles.locationContainer}>
              <Icon name="job" size={16} color={theme.colors.textLight} />
              <Text style={styles.mandatory}>{job.industry}</Text>
              <Icon name="location" size={16} color={theme.colors.textLight} />
              <Text style={styles.location}>
                {job.location || "Location not specified"}
              </Text>
            </View>
            <Text style={styles.postedBy}>
              Posted by {job.companyName || "Unknown"} •{" "}
              {new Date(job.created_at).toDateString()}
            </Text>
          </View>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>APPLY FOR THE JOB</Text>
          </TouchableOpacity>

          {/* Tab Sections */}
          <View style={styles.tabContainer}>
            {["Job Description", "Company Details", "Contact Information"].map(
              (tab) => (
                <TouchableOpacity
                  key={tab}
                  style={activeTab === tab ? styles.tabActive : styles.tab}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={
                      activeTab === tab ? styles.tabTextActive : styles.tabText
                    }
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Render content based on the selected tab */}
          {renderTabContent()}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: wp(4),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: hp(2),
    alignItems: "center", // Center title and content
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center", // Center title text
    marginBottom: hp(1),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(1),
  },
  mandatory: {
    color: theme.colors.textLight,
    fontSize: hp(1.8),
  },
  location: {
    color: theme.colors.textLight,
    fontSize: hp(1.8),
  },
  postedBy: {
    color: theme.colors.textLight,
    fontSize: hp(1.7),
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    alignItems: "center",
    marginVertical: hp(2),
  },
  applyButtonText: {
    color: "white",
    fontSize: hp(2),
    fontWeight: theme.fonts.medium,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: hp(2),
    gap: wp(4),
  },
  tab: {
    paddingVertical: hp(1),
  },
  tabActive: {
    paddingVertical: hp(1),
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textLight,
    fontSize: hp(1.8),
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
  detailsContainer: {
    gap: hp(2),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  label: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
    width: wp(25),
  },
  value: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  descriptionContainer: {
    gap: hp(1),
  },
  descriptionItem: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.8),
  },
  questionsContainer: {
    gap: hp(1.5),
  },
  question: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.8),
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
});

export default JobDetails;
