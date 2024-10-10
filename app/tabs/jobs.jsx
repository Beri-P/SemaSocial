// /app/tabs/jobs.jsx
import React, { useState, useEffect } from "react";
import { View, FlatList, Text, Pressable, StyleSheet } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useRouter } from "expo-router";
import JobCard from "../../components/JobCard"; // Assuming JobCard is modifiable
import Loading from "../../components/Loading";
import { fetchJobs } from "../../services/jobService"; // Assuming a service to fetch jobs

let limit = 0;

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("Available Jobs");
  const [jobs, setJobs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "Available Jobs") {
      getJobs();
    }
  }, [activeTab]);

  const getJobs = async () => {
    if (!hasMore) return;
    limit += 10;
    const res = await fetchJobs(limit);
    if (res.success) {
      if (jobs.length === res.data.length) setHasMore(false);
      setJobs(res.data);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Available Jobs":
        return (
          <FlatList
            data={jobs}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                currentUser={{ id: 1, name: "Test User" }}
                router={router}
              />
            )}
            onEndReached={getJobs}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              hasMore ? (
                <Loading />
              ) : (
                <Text style={styles.noMoreJobs}>No more jobs</Text>
              )
            }
          />
        );
      case "Job Categories":
        return <Text style={styles.tabContent}>Pick Job Categories</Text>;
      case "Job Companies":
        return <Text style={styles.tabContent}>Pick Job Companies</Text>;
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Pressable onPress={() => router.push("/newJob")}>
          <Icon
            name="plus"
            size={hp(3.2)}
            strokeWidth={2}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "Available Jobs" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Available Jobs")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Available Jobs" && styles.activeTabText,
            ]}
          >
            Available Jobs
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "Job Categories" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Job Categories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Job Categories" && styles.activeTabText,
            ]}
          >
            Job Categories
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "Job Companies" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Job Companies")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Job Companies" && styles.activeTabText,
            ]}
          >
            Job Companies
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </ScreenWrapper>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.grayLight,
    paddingBottom: 10,
    paddingHorizontal: wp(2),
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: wp(4),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: hp(2),
    color: theme.colors.gray,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.bold,
  },
  contentContainer: {
    flex: 1,
  },
  noMoreJobs: {
    textAlign: "center",
    fontSize: hp(2),
    color: theme.colors.textLight,
    marginVertical: 20,
  },
  tabContent: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 50,
  },
});
