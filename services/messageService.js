//services/messageService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./storageService";

export const fetchConversations = async (userId) => {
  try {
    const { data, error } = await supabase.rpc("get_user_conversations", {
      p_user_id: userId,
    });

    if (error) throw error;

    // Transform the data to match the expected format
    const transformedData = data.map((conversation) => {
      console.log("Conversation data:", conversation);
      return {
        id: conversation.conversation_id,
        other_user_id: conversation.other_user_id,
        other_user: {
          id: conversation.other_user_id,
          name: conversation.other_user_name,
          avatar_url: conversation.other_user_avatar,
        },
        last_message: conversation.last_message,
        updated_at: conversation.updated_at,
        unread_count: conversation.unread_count || 0,
        last_sender_id: conversation.last_sender_id,
      };
    });

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error };
  }
};

export const fetchMessages = async (conversationId, limit = 50) => {
  if (!conversationId) {
    console.error("Error: conversationId is undefined");
    return { success: false, error: "Conversation ID is required" };
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        message_text,
        created_at,
        sender_id,
        conversation_id,
        attachments (*),
        profiles (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data.reverse() };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error };
  }
};

export const sendMessage = async ({
  conversationId,
  senderId,
  text,
  attachments = [],
}) => {
  try {
    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: text,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Handle attachments (if any)
    if (attachments.length > 0) {
      const attachmentPromises = attachments.map(async (attachment) => {
        const fileName = `${senderId}/${conversationId}/${
          message.id
        }/${Date.now()}-${attachment.name}`;
        const { url, error: uploadError } = await uploadFile(
          `messages/${fileName}`,
          attachment
        );

        if (uploadError) throw uploadError;

        return supabase.from("attachments").insert({
          message_id: message.id,
          file_type: attachment.type,
          file_url: url,
          file_name: attachment.name,
          file_size: attachment.size,
        });
      });

      await Promise.all(attachmentPromises);
    }

    // Update both participants' conversation records
    await supabase
      .from("conversations")
      .update({
        last_message: text,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${conversationId}`);

    return { success: true, data: message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
};

export const markMessagesAsRead = async (conversationId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("messages")
      .update({ isread: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return { success: false, error };
  }
};

export const subscribeToMessages = (userId, callback) => {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const getOrCreateConversation = async (otherUserId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const currentUserId = String(user.id);
    const otherUserIdStr = String(otherUserId);

    // Prevent self-conversation creation
    if (currentUserId === otherUserIdStr) {
      console.warn("Attempted self-conversation creation, skipping...");
      return {
        success: false,
        error: "Cannot create a conversation with yourself",
      };
    }

    // Check if conversation already exists between current user and selected user
    const { data: existingConversation, error: existingError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserIdStr}),and(user1_id.eq.${otherUserIdStr},user2_id.eq.${currentUserId})`
      );

    if (existingError) {
      console.error("Error checking existing conversation:", existingError);
      throw existingError;
    }

    if (existingConversation && existingConversation.length > 0) {
      console.log("Found existing conversation:", existingConversation[0]);
      return { success: true, data: existingConversation[0] };
    }

    // Insert new conversation with the correct users
    const now = new Date().toISOString();
    const [user1_id, user2_id] = [currentUserId, otherUserIdStr].sort();

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([
        {
          user1_id,
          user2_id,
          last_message: "",
          last_message_at: now,
          updated_at: now,
          created_at: now,
          owner_id: currentUserId,
          other_user_id: otherUserIdStr,
        },
      ])
      .select();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }

    console.log("Created new conversation:", conversation[0]);
    return { success: true, data: conversation[0] };
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    return { success: false, error };
  }
};

export const fetchUserDetails = async (userId) => {
  if (!userId) {
    console.error("Error: userId is undefined");
    return { success: false, error: "User ID is required" };
  }

  try {
    const { data, error } = await supabase
      .from("profiles") // Ensure this is the correct table name
      .select("id, name, bio, image") // Update with actual column names
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { success: false, error };
  }
};
