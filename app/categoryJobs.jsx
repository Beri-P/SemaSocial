// /app/categoryJobs.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import JobCard from "../components/JobCard";
import Icon from "../assets/icons";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Loading from "../components/Loading";
import { fetchJobsByCategory } from "../services/jobService";

const CategoryJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { category } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    getJobs();
  }, [category]);

  const getJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchJobsByCategory(category);
      if (res.success) {
        setJobs(res.data);
      }
    } catch (error) {
      console.error("Error fetching category jobs:", error);
    }
    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Jobs</Text>
        <TouchableOpacity
          //onPress={() => router.push("/search")}
          onPress={() =>
            Alert.alert("Notice", "Search functionality not ready yet")
          }
        >
          <Icon name="search" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <JobCard job={item} router={router} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No jobs found in this category
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    flex: 1,
    textAlign: "center",
    marginHorizontal: wp(4),
  },
  listContent: {
    paddingTop: hp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: hp(10),
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: "center",
  },
});

export default CategoryJobs;
