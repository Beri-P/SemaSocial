// /app/tabs/jobs.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useRouter } from "expo-router";
import JobCard from "../../components/JobCard";
import Loading from "../../components/Loading";
import { fetchJobs } from "../../services/jobService";

// Category data structure remains the same, but without static job counts
const categories = [
  { id: 1, name: "Accounting", icon: "accounting" },
  { id: 2, name: "Administration", icon: "administration" },
  { id: 3, name: "Hospitality", icon: "hospitality" },
  { id: 4, name: "Audit", icon: "audit" },
  { id: 5, name: "Media", icon: "media" },
  { id: 6, name: "Automotive", icon: "automotive" },
  { id: 7, name: "Architectural", icon: "architectural" },
  { id: 8, name: "Agricultural", icon: "agriculture" },
  { id: 9, name: "Programming", icon: "programming" },
];

const CategoryCard = ({ category, jobCount, onPress }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={() => onPress(category)}
  >
    <View style={styles.categoryIconContainer}>
      <Icon name={category.icon} size={40} color={theme.colors.primary} />
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
    <Text style={styles.categoryJobs}>{jobCount} jobs</Text>
  </TouchableOpacity>
);

const CompanyCard = ({ company, onPress }) => (
  <TouchableOpacity style={styles.companyCard} onPress={() => onPress(company)}>
    <View style={styles.companyInfo}>
      <Text style={styles.companyName}>{company.companyName}</Text>
      <Text style={styles.companyCategory}>{company.industry}</Text>
      <View style={styles.companyStats}>
        <Icon name="job" size={16} color={theme.colors.textLight} />
        <Text style={styles.statText}>{company.jobCount} jobs</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("Browse Job");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categoryJobCounts, setCategoryJobCounts] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const limit = 10;

  useEffect(() => {
    if (activeTab === "Browse Job") {
      getJobs();
    } else if (activeTab === "Browse Companies") {
      getCompanies();
    } else if (activeTab === "Browse Categories") {
      getCategoryJobCounts();
    }
  }, [activeTab]);

  const getJobs = async () => {
    if (!hasMore) return;
    const res = await fetchJobs(limit);
    if (res.success) {
      if (jobs.length === res.data.length) setHasMore(false);
      setJobs(res.data);
    }
    setLoading(false);
  };

  const getCompanies = async () => {
    try {
      const res = await fetchJobs(1000); // Fetch a large number of jobs to process company data
      if (res.success) {
        // Process jobs to get unique companies with job counts
        const companyMap = new Map();
        res.data.forEach((job) => {
          if (!companyMap.has(job.companyName)) {
            companyMap.set(job.companyName, {
              companyName: job.companyName,
              industry: job.industry,
              companyDescription: job.companyDescription,
              jobCount: 1,
            });
          } else {
            companyMap.get(job.companyName).jobCount++;
          }
        });
        setCompanies(Array.from(companyMap.values()));
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setLoading(false);
  };

  const getCategoryJobCounts = async () => {
    try {
      const res = await fetchJobs(1000); // Fetch a large number of jobs to process category counts
      if (res.success) {
        const counts = {};
        res.data.forEach((job) => {
          if (job.category) {
            counts[job.category] = (counts[job.category] || 0) + 1;
          }
        });
        setCategoryJobCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching category counts:", error);
    }
    setLoading(false);
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/categoryJobs",
      params: { category: category.name },
    });
  };

  const handleCompanyPress = (company) => {
    router.push({
      pathname: "/companyJobs",
      params: {
        companyName: company.companyName,
      },
    });
  };

  const renderJobsList = () => (
    <FlatList
      key="jobsList"
      data={jobs}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <JobCard job={item} router={router} />}
      onEndReached={getJobs}
      onEndReachedThreshold={0.1}
      ListFooterComponent={hasMore ? <Loading /> : null}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderCategoriesList = () => (
    <FlatList
      key="categoriesList"
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          jobCount={categoryJobCounts[item.name] || 0}
          onPress={handleCategoryPress}
        />
      )}
      contentContainerStyle={styles.categoriesContainer}
    />
  );

  const renderCompaniesList = () => (
    <FlatList
      key="companiesList"
      data={companies}
      keyExtractor={(item) => item.companyName}
      renderItem={({ item }) => (
        <CompanyCard company={item} onPress={handleCompanyPress} />
      )}
      contentContainerStyle={styles.companiesContainer}
    />
  );

  const renderContent = () => {
    if (loading) return <Loading />;

    switch (activeTab) {
      case "Browse Categories":
        return renderCategoriesList();
      case "Browse Companies":
        return renderCompaniesList();
      default:
        return renderJobsList();
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
            //onPress={() => router.push("/search")}
            onPress={() =>
              Alert.alert("Notice", "Search functionality not ready yet")
            }
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
