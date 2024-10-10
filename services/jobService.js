// jobService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService"; // Assuming file upload function exists in imageService

// Fetch jobs with pagination
export const fetchJobs = async (limit) => {
  try {
    // Fetch jobs with related user data (name and image)
    const { data, error } = await supabase
      .from("jobs")
      .select(`*, user:users(id, name, image)`) // Fetch user details from the related 'users' table
      .order("created_at", { ascending: false }) // Fetch latest jobs first
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

// Create or update a job
export const createOrUpdateJob = async (job) => {
  try {
    // If the job has a file (image or video), upload it first
    if (job.file && typeof job.file === "object") {
      const isImage = job?.file?.type === "image";
      const folderName = isImage ? "jobImages" : "jobVideos";
      const fileResult = await uploadFile(folderName, job?.file?.uri, isImage);

      if (fileResult.success) {
        job.file = fileResult.data; // Update the job file with the uploaded file URL
      } else {
        return fileResult;
      }
    }

    // Insert or update the job in Supabase (userId included)
    const { data, error } = await supabase
      .from("jobs")
      .upsert(job) // Insert or update the job, userId is included
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
