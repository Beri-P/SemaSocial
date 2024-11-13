// jobService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

// Fetch all jobs with pagination
export const fetchJobs = async (limit) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        userId,
        created_at,
        updated_at,
        salary,
        companyWebsite,
        companyDescription,
        industry,
        title,
        customUrl,
        skills,
        startDate,
        category,
        shortDescription,
        jobDescription,
        file,
        otherPays,
        requiredExperience,
        employmentType,
        educationLevel,
        contactName,
        email,
        phone,
        facebook,
        website,
        jobContactEmail,
        linkForApply,
        privacy,
        commentPrivacy,
        status,
        companyName,
        user:users(id, name, image)
      `
      ) // Only existing fields
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetchJobs error", error);
      return { success: false, msg: "Failed to fetch jobs" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchJobs error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Fetch jobs by category
export const fetchJobsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        userId,
        created_at,
        updated_at,
        salary,
        companyWebsite,
        companyDescription,
        industry,
        title,
        customUrl,
        skills,
        startDate,
        category,
        shortDescription,
        jobDescription,
        file,
        otherPays,
        requiredExperience,
        employmentType,
        educationLevel,
        contactName,
        email,
        phone,
        facebook,
        website,
        jobContactEmail,
        linkForApply,
        privacy,
        commentPrivacy,
        status,
        companyName,
        user:users(id, name, image)
      `
      )
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchJobsByCategory error", error);
      return { success: false, msg: "Failed to fetch jobs for this category" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchJobsByCategory error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Fetch jobs by companyName
export const fetchJobsByCompany = async (companyName) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        userId,
        created_at,
        updated_at,
        salary,
        companyWebsite,
        companyDescription,
        industry,
        title,
        customUrl,
        skills,
        startDate,
        category,
        shortDescription,
        jobDescription,
        file,
        otherPays,
        requiredExperience,
        employmentType,
        educationLevel,
        contactName,
        email,
        phone,
        facebook,
        website,
        jobContactEmail,
        linkForApply,
        privacy,
        commentPrivacy,
        status,
        companyName,
        user:users(id, name, image)
      `
      )
      .eq("companyName", companyName)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchJobsByCompany error", error);
      return { success: false, msg: "Failed to fetch jobs for this company" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchJobsByCompany error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Create or update a job
export const createOrUpdateJob = async (job) => {
  try {
    if (job.file && typeof job.file === "object") {
      const isImage = job?.file?.type === "image";
      const folderName = isImage ? "jobImages" : "jobVideos";
      const fileResult = await uploadFile(folderName, job?.file?.uri, isImage);

      if (fileResult.success) {
        job.file = fileResult.data;
      } else {
        return fileResult;
      }
    }

    const { data, error } = await supabase
      .from("jobs")
      .upsert(job)
      .select()
      .single();

    if (error) {
      console.log("createOrUpdateJob error", error);
      return { success: false, msg: "Failed to create/update the job" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("createOrUpdateJob error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Like a job
export const createJobLike = async (like) => {
  try {
    const { data, error } = await supabase.from("job_likes").insert(like);
    if (error) {
      console.log("createJobLike error", error);
      return { success: false, msg: "Failed to like the job" };
    }
    return { success: true, data };
  } catch (error) {
    console.log("createJobLike error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Remove a job like
export const removeJobLike = async (jobId, userId) => {
  try {
    const { data, error } = await supabase
      .from("job_likes")
      .delete()
      .eq("jobId", jobId)
      .eq("userId", userId);

    if (error) {
      console.log("removeJobLike error", error);
      return { success: false, msg: "Failed to remove job like" };
    }
    return { success: true, data };
  } catch (error) {
    console.log("removeJobLike error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

// Fetch details of a specific job by ID
export const fetchJobDetails = async (jobId) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        userId,
        created_at,
        updated_at,
        salary,
        companyWebsite,
        companyDescription,
        industry,
        title,
        customUrl,
        skills,
        startDate,
        category,
        shortDescription,
        jobDescription,
        file,
        otherPays,
        requiredExperience,
        employmentType,
        educationLevel,
        contactName,
        email,
        phone,
        facebook,
        website,
        jobContactEmail,
        linkForApply,
        privacy,
        commentPrivacy,
        status,
        companyName,
        user:users(id, name, image)
      `
      )
      .eq("id", jobId)
      .single();

    if (error) {
      console.log("fetchJobDetails error", error);
      return { success: false, msg: "Failed to fetch job details" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchJobDetails error", error);
    return { success: false, msg: "An unexpected error occurred" };
  }
};

export default {
  fetchJobs,
  fetchJobsByCategory,
  fetchJobsByCompany,
  fetchJobDetails,
  createOrUpdateJob,
  createJobLike,
  removeJobLike,
};
