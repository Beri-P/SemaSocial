//userService.js
import { supabase } from "../lib/supabase";

// Fetch user data by their ID
export const getProfileById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("getProfileById error:", error);
    return { success: false, msg: error.message };
  }
};

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error?.message };
    }
    return { success: true, data };
  } catch (error) {
    console.log("got error: ", error);
    return { success: false, msg: error.message };
  }
};
export const updateUser = async (userId, data) => {
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error?.message };
    }
    return { success: true, data };
  } catch (error) {
    console.log("got error: ", error);
    return { success: false, msg: error.message };
  }
};

// Fetch all users for messaging
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, image");

    // Debug log the raw response
    console.log("Raw Supabase response:", { data, error });

    if (error) {
      console.error("fetchUsers error:", error);
      return { success: false, msg: "Could not fetch users" };
    }

    // Ensure we have an array of properly formatted user objects
    const sanitizedData =
      data?.map((user) => ({
        id: user.id?.toString() || "", // Ensure ID is a string
        name: user.name?.toString() || "",
        image: user.image?.toString() || null,
      })) || [];

    // Debug log the sanitized data
    console.log("Sanitized data:", sanitizedData);

    if (!sanitizedData || sanitizedData.length === 0) {
      return { success: false, msg: "No users found." };
    }

    return {
      success: true,
      data: sanitizedData,
    };
  } catch (error) {
    console.error("fetchUsers unexpected error:", error);
    return {
      success: false,
      msg: "Could not fetch users due to a network or server error.",
    };
  }
};
