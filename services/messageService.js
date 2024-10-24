//services/messageService.js
import { supabase } from "../lib/supabase";
import { uploadFile } from "./storageService";

export const fetchConversations = async (userId) => {
  try {
    const { data, error } = await supabase.rpc("get_user_conversations", {
      user_id: userId,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error };
  }
};

export const fetchMessages = async (conversationId, limit = 50) => {
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
        sender:profiles!sender_id (
          id,
          full_name,
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
    // Insert message into the messages table
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
        // Generate a unique file name for the storage path
        const fileName = `${senderId}/${conversationId}/${
          message.id
        }/${Date.now()}-${attachment.name}`;

        // Upload the file using the uploadFile function
        const { url, error: uploadError } = await uploadFile(
          `messages/${fileName}`,
          attachment
        );

        if (uploadError) throw uploadError;

        // Create an attachment record in the attachments table
        return supabase.from("attachments").insert({
          message_id: message.id, // Link the attachment to the message
          file_type: attachment.type, // Use the attachment's file type (e.g., image, file, etc.)
          file_url: url, // Store the uploaded file's URL
          file_name: attachment.name, // Store the original file name
          file_size: attachment.size, // Store the file size
        });
      });

      // Wait for all attachment upload and record creation promises to resolve
      await Promise.all(attachmentPromises);
    }

    // Update conversation's last_message and updated_at fields
    await supabase
      .from("conversations")
      .update({
        last_message: text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

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
      .update({ is_read: true })
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

    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      p_user1_id: user.id,
      p_user2_id: otherUserId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    return { success: false, error };
  }
};
