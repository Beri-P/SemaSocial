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
      .from("users") // Adjust to your table name
      .select("id, name, image"); // Select the fields you need

    if (error) {
      console.error("fetchUsers error:", error);
      return { success: false, msg: "Could not fetch users" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("fetchUsers error:", error);
    return { success: false, msg: "Could not fetch users" };
  }
};
