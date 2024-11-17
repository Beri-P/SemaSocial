//postService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
  try {
    //upload image
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) post.file = fileResult.data;
      else {
        return fileResult;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.log("createPost error", error);
      return { success: false, msg: "Could not create your post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("createPost error", error);
    return { success: false, msg: "Could not create your post" };
  }
};
// Fetch posts with improved error handling
export const fetchPosts = async (limit = 10, offset = 0, userId) => {
  try {
    let query = supabase
      .from("posts")
      .select(
        "*, user: profiles (id, name, image), postLikes (*), comments (count)"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("userId", userId); // Filter by userId
    }

    const { data, error } = await query;

    if (error) {
      console.log("fetchPosts error", error);
      return { success: false, msg: "Could not fetch posts" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("fetchPosts error:", error);
    return {
      success: false,
      msg: "Could not fetch posts due to network issues",
    };
  }
};
export const fetchPostDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "*, user: profiles (id, name, image), postLikes (*), comments (*, user: profiles(id, name, image))"
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.log("fetchPostDetails error", error);
      return { success: false, msg: "Could not fetch the post details" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPostDetails error", error);
    return { success: false, msg: "Could not fetch the post details" };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.log("postLike error", error);
      return { success: false, msg: "Could not like the post" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("postLike error", error);
    return { success: false, msg: "Could not like the post" };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.log("postLike error", error);
      return { success: false, msg: "Could not remove the post like" };
    }

    return { success: true };
  } catch (error) {
    console.log("postLike error", error);
    return { success: false, msg: "Could not remove the post like" };
  }
};

export const createComment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.log("comment error", error);
      return { success: false, msg: "Could not create your comment" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("comment error", error);
    return { success: false, msg: "Could not create your comment" };
  }
};

export const removeComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log("removeComment error", error);
      return { success: false, msg: "Could not remove the comment" };
    }

    return { success: true, data: { commentId } };
  } catch (error) {
    console.log("removeComment error", error);
    return { success: false, msg: "Could not remove the comment" };
  }
};
export const removePost = async (postId) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.log("removePost error", error);
      return { success: false, msg: "Could not remove the post" };
    }

    return { success: true, data: { postId } };
  } catch (error) {
    console.log("removePost error", error);
    return { success: false, msg: "Could not remove the post" };
  }
};
