// /app/tabs/jobs.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useRouter } from "expo-router";
import JobCard from "../../components/JobCard";
import Loading from "../../components/Loading";
import { fetchJobs } from "../../services/jobService";

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("Browse Job");
  const [jobs, setJobs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const limit = 10;

  useEffect(() => {
    if (activeTab === "Browse Job") {
      getJobs();
    }
  }, [activeTab]);

  const getJobs = async () => {
    if (!hasMore) return;
    const res = await fetchJobs(limit);
    if (res.success) {
      if (jobs.length === res.data.length) setHasMore(false);
      setJobs(res.data);
    }
  };

  const tabs = ["Browse Job", "Browse Categories", "Browse Companies"];

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Icon name="search" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={jobs}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <JobCard job={item} router={router} />}
        onEndReached={getJobs}
        onEndReachedThreshold={0.1}
        ListFooterComponent={hasMore ? <Loading /> : null}
        contentContainerStyle={styles.listContent}
      />
    </ScreenWrapper>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayLight,
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    backgroundColor: theme.colors.white,
    paddingVertical: hp(1),
  },
  tab: {
    marginRight: wp(6),
    paddingBottom: hp(1),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.bold,
  },
  listContent: {
    paddingTop: hp(2),
  },
});
