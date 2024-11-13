// app/(main)/newJob.jsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Button from "../../components/Button";
import { createOrUpdateJob } from "../../services/jobService";
import { getSupabaseFileUrl } from "../../services/imageService";
import Icon from "../../assets/icons";
import { useAuth } from "../../contexts/AuthContext";

// Dropdown options
const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "technology" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Finance", value: "finance" },
  { label: "Education", value: "education" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "Construction", value: "construction" },
  { label: "Hospitality", value: "hospitality" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Temporary", value: "temporary" },
  { label: "Internship", value: "internship" },
  { label: "Remote", value: "remote" },
];

const EDUCATION_LEVEL_OPTIONS = [
  { label: "High School", value: "high_school" },
  { label: "Bachelor's Degree", value: "bachelors" },
  { label: "Master's Degree", value: "masters" },
  { label: "PhD", value: "phd" },
  { label: "Associate Degree", value: "associate" },
  { label: "Certification", value: "certification" },
  { label: "No Formal Education", value: "none" },
];

const PRIVACY_OPTIONS = [
  { label: "All Registered Members", value: "all_members" },
  { label: "Only Connected Members", value: "connected_members" },
  { label: "Private", value: "private" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
  { label: "Expired", value: "expired" },
];

const CATEGORY_OPTIONS = [
  { label: "Software Development", value: "software_dev" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Administrative", value: "administrative" },
  { label: "Engineering", value: "engineering" },
  { label: "Management", value: "management" },
];

const FormField = ({ label, children }) => (
  <View style={styles.fieldCard}>
    <Text style={styles.inputLabel}>{label}</Text>
    {children}
  </View>
);

const PickerField = ({ label, value, onValueChange, items }) => (
  <FormField label={label}>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={`Select ${label}`} value="" />
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  </FormField>
);

const NewJob = () => {
  const { job } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    companyWebsite: "",
    companyDescription: "",
    industry: "",
    title: "",
    customUrl: "",
    skills: "",
    startDate: "",
    category: "",
    shortDescription: "",
    jobDescription: "",
    salary: "",
    otherPays: "",
    requiredExperience: "",
    employmentType: "",
    educationLevel: "",
    contactName: "",
    email: "",
    phone: "",
    facebook: "",
    website: "",
    jobContactEmail: "",
    linkForApply: "",
    privacy: "All Registered Members",
    commentPrivacy: "All Registered Members",
    status: "",
  });

  useEffect(() => {
    if (job && job.id) {
      setJobDetails(job);
      setFile(job.file || null);
    }
  }, [job]);

  const handleInputChange = (field, value) => {
    setJobDetails({ ...jobDetails, [field]: value });
  };

  const onPickFile = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };
    if (!isImage) {
      mediaConfig.mediaTypes = ImagePicker.MediaTypeOptions.Videos;
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const getFileType = () => {
    if (!file) return null;
    if (typeof file === "object") return file.type;
    return file.includes("jobImages") ? "image" : "video";
  };

  const getFileUri = () => {
    if (!file) return null;
    if (typeof file === "object") return file.uri;
    return getSupabaseFileUrl(file)?.uri;
  };

  const onSubmit = async () => {
    if (!jobDetails.title || !jobDetails.jobDescription) {
      Alert.alert("Job", "Please provide job title and description.");
      return;
    }

    const data = { ...jobDetails, file, userId: user?.id };
    if (job && job.id) data.id = job.id;

    setLoading(true);
    const response = await createOrUpdateJob(data);
    setLoading(false);

    if (response.success) {
      setFile(null);
      setJobDetails({});
      router.back();
    } else {
      Alert.alert("Job", response.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title={job && job.id ? "Edit Job" : "Create New Job"} />
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <FormField label="Company Name">
              <TextInput
                style={styles.input}
                value={jobDetails.companyName}
                onChangeText={(text) => handleInputChange("companyName", text)}
                placeholder="Enter company name"
              />
            </FormField>

            <FormField label="Company Website URL">
              <TextInput
                style={styles.input}
                value={jobDetails.companyWebsite}
                onChangeText={(text) =>
                  handleInputChange("companyWebsite", text)
                }
                placeholder="https://example.com"
              />
            </FormField>

            <FormField label="Company Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobDetails.companyDescription}
                onChangeText={(text) =>
                  handleInputChange("companyDescription", text)
                }
                placeholder="Describe your company"
                multiline
                numberOfLines={4}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            <FormField label="Title">
              <TextInput
                style={styles.input}
                value={jobDetails.title}
                onChangeText={(text) => handleInputChange("title", text)}
                placeholder="Job title"
              />
            </FormField>

            <PickerField
              label="Industry"
              value={jobDetails.industry}
              onValueChange={(value) => handleInputChange("industry", value)}
              items={INDUSTRY_OPTIONS}
            />

            <PickerField
              label="Employment Type"
              value={jobDetails.employmentType}
              onValueChange={(value) =>
                handleInputChange("employmentType", value)
              }
              items={EMPLOYMENT_TYPE_OPTIONS}
            />

            <FormField label="Skills">
              <TextInput
                style={styles.input}
                value={jobDetails.skills}
                onChangeText={(text) => handleInputChange("skills", text)}
                placeholder="Required skills (comma separated)"
              />
            </FormField>

            <FormField label="Job Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobDetails.jobDescription}
                onChangeText={(text) =>
                  handleInputChange("jobDescription", text)
                }
                placeholder="Detailed job description"
                multiline
                numberOfLines={6}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            <FormField label="Salary">
              <TextInput
                style={styles.input}
                value={jobDetails.salary}
                onChangeText={(text) => handleInputChange("salary", text)}
                placeholder="Salary range or fixed amount"
              />
            </FormField>

            <FormField label="Other Benefits">
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobDetails.otherPays}
                onChangeText={(text) => handleInputChange("otherPays", text)}
                placeholder="Additional benefits"
                multiline
                numberOfLines={3}
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <FormField label="Required Experience">
              <TextInput
                style={styles.input}
                value={jobDetails.requiredExperience}
                onChangeText={(text) =>
                  handleInputChange("requiredExperience", text)
                }
                placeholder="Years of experience required"
              />
            </FormField>

            <PickerField
              label="Education Level"
              value={jobDetails.educationLevel}
              onValueChange={(value) =>
                handleInputChange("educationLevel", value)
              }
              items={EDUCATION_LEVEL_OPTIONS}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <FormField label="Contact Name">
              <TextInput
                style={styles.input}
                value={jobDetails.contactName}
                onChangeText={(text) => handleInputChange("contactName", text)}
                placeholder="Contact person's name"
              />
            </FormField>

            <FormField label="Email">
              <TextInput
                style={styles.input}
                value={jobDetails.email}
                onChangeText={(text) => handleInputChange("email", text)}
                placeholder="Contact email"
                keyboardType="email-address"
              />
            </FormField>

            <FormField label="Phone">
              <TextInput
                style={styles.input}
                value={jobDetails.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="Contact phone number"
                keyboardType="phone-pad"
              />
            </FormField>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <PickerField
              label="Privacy"
              value={jobDetails.privacy}
              onValueChange={(value) => handleInputChange("privacy", value)}
              items={PRIVACY_OPTIONS}
            />

            <PickerField
              label="Comment Privacy"
              value={jobDetails.commentPrivacy}
              onValueChange={(value) =>
                handleInputChange("commentPrivacy", value)
              }
              items={PRIVACY_OPTIONS}
            />

            <PickerField
              label="Status"
              value={jobDetails.status}
              onValueChange={(value) => handleInputChange("status", value)}
              items={STATUS_OPTIONS}
            />
          </View>

          {/* File upload section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media</Text>
            {file && (
              <View style={styles.file}>
                {getFileType() === "video" ? (
                  <Video
                    style={{ flex: 1 }}
                    source={{ uri: getFileUri() }}
                    useNativeControls
                    resizeMode="cover"
                    isLooping
                  />
                ) : (
                  <Image
                    source={{ uri: getFileUri() }}
                    resizeMode="cover"
                    style={{ flex: 1 }}
                  />
                )}
                <Pressable
                  style={styles.closeIcon}
                  onPress={() => setFile(null)}
                >
                  <Icon name="delete" size={20} color="white" />
                </Pressable>
              </View>
            )}

            <View style={styles.media}>
              <Text style={styles.addFileText}>Add a file to the job</Text>
              <View style={styles.mediaIcons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => onPickFile(true)}
                >
                  <Icon name="image" size={30} color={theme.colors.dark} />
                  <Text style={styles.mediaButtonText}>Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => onPickFile(false)}
                >
                  <Icon name="video" size={33} color={theme.colors.dark} />
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <Button
          buttonStyle={styles.submitButton}
          title={job && job.id ? "Update Job" : "Post Job"}
          loading={loading}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewJob;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: wp(4),
  },
  formContainer: {
    paddingBottom: hp(10),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: hp(2),
    paddingLeft: wp(2),
  },
  fieldCard: {
    backgroundColor: "white",
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputLabel: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginBottom: hp(1),
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    padding: hp(1.5),
    borderRadius: theme.radius.sm,
    fontSize: hp(1.8),
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: hp(12),
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: hp(6),
    width: "100%",
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    marginBottom: hp(2),
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "rgba(255,0,0,0.6)",
  },
  media: {
    backgroundColor: "white",
    borderRadius: theme.radius.lg,
    padding: hp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mediaIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(2),
  },
  mediaButton: {
    alignItems: "center",
    padding: hp(1.5),
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.md,
    width: wp(25),
    marginHorizontal: wp(2),
  },
  mediaButtonText: {
    marginTop: hp(1),
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  addFileText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    textAlign: "center",
  },
  submitButton: {
    height: hp(6.2),
    marginHorizontal: wp(4),
    marginVertical: hp(2),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
});
