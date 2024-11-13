// /app/tabs/jobs.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useRouter } from "expo-router";
import JobCard from "../../components/JobCard";
import Loading from "../../components/Loading";
import { fetchJobs } from "../../services/jobService";

const categories = [
  { id: 1, name: "Accounting", jobs: "2K", icon: "accounting" },
  { id: 2, name: "Administration", jobs: "2.8K", icon: "administration" },
  { id: 3, name: "Hospitality", jobs: "79", icon: "hospitality" },
  { id: 4, name: "Audit", jobs: "50", icon: "audit" },
  { id: 5, name: "Media", jobs: "702", icon: "media" },
  { id: 6, name: "Automotive", jobs: "2", icon: "automotive" },
  { id: 7, name: "Architectural", jobs: "163", icon: "architectural" },
  { id: 8, name: "Agricultural", jobs: "281", icon: "agriculture" },
  { id: 9, name: "Programming", jobs: "1.4K", icon: "programming" },
];

const companies = [
  {
    id: 1,
    name: "MNR Solutions Pvt. Ltd",
    category: "Consulting",
    jobs: 1,
    applications: 0,
  },
  {
    id: 2,
    name: "Adili Group",
    category: "Consulting",
    jobs: 2,
    applications: 0,
  },
  {
    id: 3,
    name: "ACORN Law",
    category: "Legal Services",
    jobs: 2,
    applications: 0,
  },
  {
    id: 4,
    name: "Timeless Timber",
    category: "Electrical/Electronic Manufacturing",
    jobs: 2,
    applications: 0,
  },
  {
    id: 5,
    name: "Cottar's Safaris",
    category: "Hospitality",
    jobs: 2,
    applications: 0,
  },
  {
    id: 6,
    name: "G&A Advocates",
    category: "Legal Services",
    jobs: 3,
    applications: 0,
  },
];

const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={() => onPress(category)}
  >
    <View style={styles.categoryIconContainer}>
      <Icon name={category.icon} size={40} color={theme.colors.primary} />
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
    <Text style={styles.categoryJobs}>{category.jobs} jobs</Text>
  </TouchableOpacity>
);

const CompanyCard = ({ company, onPress }) => (
  <TouchableOpacity style={styles.companyCard} onPress={() => onPress(company)}>
    <Image
      source={require("../../assets/images/defaultUser.png")}
      style={styles.companyLogo}
    />
    <View style={styles.companyInfo}>
      <Text style={styles.companyName}>{company.name}</Text>
      <Text style={styles.companyCategory}>{company.category}</Text>
      <View style={styles.companyStats}>
        <Icon name="media" size={16} color={theme.colors.textLight} />
        <Text style={styles.statText}>{company.applications}</Text>
        <Icon name="job" size={16} color={theme.colors.textLight} />
        <Text style={styles.statText}>{company.jobs}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

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

  const renderContent = () => {
    switch (activeTab) {
      case "Browse Categories":
        return (
          <FlatList
            data={categories}
            numColumns={2}
            key={"categories"} // use 'categories' as the key when rendering categories
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CategoryCard category={item} />}
            contentContainerStyle={styles.categoriesContainer}
          />
        );
      case "Browse Companies":
        return (
          <FlatList
            data={companies}
            key={"companies"} // use 'companies' as the key when rendering companies
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CompanyCard company={item} />}
            contentContainerStyle={styles.companiesContainer}
          />
        );
      default:
        return (
          <FlatList
            data={jobs}
            showsVerticalScrollIndicator={false}
            key={"jobs"} // use 'jobs' as the key when rendering jobs
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <JobCard job={item} router={router} />}
            onEndReached={getJobs}
            onEndReachedThreshold={0.1}
            ListFooterComponent={hasMore ? <Loading /> : null}
            contentContainerStyle={styles.listContent}
          />
        );
    }
  };

  const tabs = ["Browse Job", "Browse Categories", "Browse Companies"];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "Browse Categories"
            ? "Categories"
            : activeTab === "Browse Companies"
            ? "Companies"
            : "Jobs"}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push("/search")}
          >
            <Icon name="search" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(main)/newJob")}>
            <Icon name="plus" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
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

      {renderContent()}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.darkLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: theme.colors.white,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: wp(2),
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
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
    color: theme.colors.dark,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.bold,
  },
  listContent: {
    paddingTop: hp(2),
  },
  // Category Card Styles
  categoriesContainer: {
    padding: wp(4),
  },
  categoryCard: {
    flex: 1,
    margin: wp(2),
    padding: wp(4),
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp(15),
  },
  categoryIconContainer: {
    marginBottom: hp(1),
  },
  categoryName: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    textAlign: "center",
    marginBottom: hp(0.5),
  },
  categoryJobs: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  // Company Card Styles
  companiesContainer: {
    padding: wp(4),
  },
  companyCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: wp(4),
    marginBottom: hp(2),
    borderColor: theme.colors.grayLight,
  },
  companyLogo: {
    width: wp(15),
    height: wp(15),
    borderRadius: theme.radius.sm,
    marginRight: wp(3),
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(0.5),
  },
  companyCategory: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginBottom: hp(0.5),
  },
  companyStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginLeft: wp(1),
    marginRight: wp(3),
  },
});

export default Jobs;
