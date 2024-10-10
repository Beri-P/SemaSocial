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

const NewJob = () => {
  const { job } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth(); // Get the currently authenticated user
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
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.companyName}
              onChangeText={(text) => handleInputChange("companyName", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Website URL</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.companyWebsite}
              onChangeText={(text) => handleInputChange("companyWebsite", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Description</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.companyDescription}
              onChangeText={(text) =>
                handleInputChange("companyDescription", text)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.title}
              onChangeText={(text) => handleInputChange("title", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Custom URL</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.customUrl}
              onChangeText={(text) => handleInputChange("customUrl", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Skills</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.skills}
              onChangeText={(text) => handleInputChange("skills", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Short Description</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.shortDescription}
              onChangeText={(text) =>
                handleInputChange("shortDescription", text)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Job Description</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.jobDescription}
              onChangeText={(text) => handleInputChange("jobDescription", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Salary</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.salary}
              onChangeText={(text) => handleInputChange("salary", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Other Pays</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.otherPays}
              onChangeText={(text) => handleInputChange("otherPays", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Required Experience</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.requiredExperience}
              onChangeText={(text) =>
                handleInputChange("requiredExperience", text)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.contactName}
              onChangeText={(text) => handleInputChange("contactName", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.facebook}
              onChangeText={(text) => handleInputChange("facebook", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.website}
              onChangeText={(text) => handleInputChange("website", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Job Contact Email</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.jobContactEmail}
              onChangeText={(text) =>
                handleInputChange("jobContactEmail", text)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Link to Apply</Text>
            <TextInput
              style={styles.input}
              value={jobDetails.linkForApply}
              onChangeText={(text) => handleInputChange("linkForApply", text)}
            />
          </View>

          {/* Dropdown for Industry */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Industry</Text>
            <Picker
              selectedValue={jobDetails.industry}
              onValueChange={(itemValue) =>
                handleInputChange("industry", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Industry" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <Picker
              selectedValue={jobDetails.startDate}
              onValueChange={(itemValue) =>
                handleInputChange("startDate", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Start Date" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <Picker
              selectedValue={jobDetails.category}
              onValueChange={(itemValue) =>
                handleInputChange("category", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Employment Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Employment Type</Text>
            <Picker
              selectedValue={jobDetails.employmentType}
              onValueChange={(itemValue) =>
                handleInputChange("employmentType", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Employment Type" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Education Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Education Level</Text>
            <Picker
              selectedValue={jobDetails.educationLevel}
              onValueChange={(itemValue) =>
                handleInputChange("educationLevel", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Education Level" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Privacy */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Privacy</Text>
            <Picker
              selectedValue={jobDetails.privacy}
              onValueChange={(itemValue) =>
                handleInputChange("privacy", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Privacy" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Comment Privacy */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Comment Privacy</Text>
            <Picker
              selectedValue={jobDetails.commentPrivacy}
              onValueChange={(itemValue) =>
                handleInputChange("commentPrivacy", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Comment Privacy" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>

          {/* Dropdown for Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <Picker
              selectedValue={jobDetails.status}
              onValueChange={(itemValue) =>
                handleInputChange("status", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Status" value="" />
              <Picker.Item label="Technology" value="technology" />
              <Picker.Item label="Healthcare" value="healthcare" />
              {/* Add other options as needed */}
            </Picker>
          </View>
          {/* Add file preview for job (image or video) */}
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
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="delete" size={20} color="white" />
              </Pressable>
            </View>
          )}

          {/* File Upload Options */}
          <View style={styles.media}>
            <Text style={styles.addFileText}>Add a file to the job</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPickFile(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPickFile(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
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
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: hp(2),
    color: theme.colors.textLight,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    padding: 10,
    borderRadius: theme.radius.sm,
    fontSize: hp(2),
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    borderRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
  },
  addFileText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
  },
  submitButton: {
    height: hp(6.2),
    marginHorizontal: wp(4),
    marginTop: 15,
  },
});
