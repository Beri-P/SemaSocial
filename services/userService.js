//userService.js
import { supabase } from "../lib/supabase";

// Fetch user data by their ID
export const getProfileById = async (userId) => {
  if (!userId) {
    console.error("getProfileById: No userId provided");
    return { success: false, msg: "No user ID provided" };
  }

  try {
    // Change from 'users' to 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      console.error("getProfileById error:", error);
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("getProfileById error:", error);
    return { success: false, msg: error.message };
  }
};

export const getUserData = async (userId) => {
  if (!userId) {
    console.error("getUserData: No userId provided");
    return { success: false, msg: "No user ID provided" };
  }

  try {
    // Change from 'users' to 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      console.error("getUserData error:", error);
      return { success: false, msg: error?.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("getUserData error:", error);
    return { success: false, msg: error.message };
  }
};

export const updateUser = async (userId, data) => {
  if (!userId) {
    console.error("updateUser: No userId provided");
    return { success: false, msg: "No user ID provided" };
  }

  try {
    // Change from 'users' to 'profiles' table
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (error) {
      console.error("updateUser error:", error);
      return { success: false, msg: error?.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("updateUser error:", error);
    return { success: false, msg: error.message };
  }
};

export const fetchUsers = async () => {
  try {
    // Change from 'users' to 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, image");

    console.log("Raw Supabase response:", { data, error });

    if (error) {
      console.error("fetchUsers error:", error);
      return { success: false, msg: "Could not fetch users" };
    }

    const sanitizedData =
      data?.map((user) => ({
        id: user.id?.toString() || "",
        name: user.name?.toString() || "",
        image: user.image?.toString() || null,
      })) || [];

    console.log("Sanitized data:", sanitizedData);

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
