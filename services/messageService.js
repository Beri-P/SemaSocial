import { supabase } from "../lib/supabase";

// Function to send a message
export const sendMessage = async (message) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: message.senderId, // Update to match your database
        receiver_id: message.receiverId, // Update to match your database
        message_text: message.messageText, // Update to match your database
        isread: false, // Assuming you want to set this when sending
        // Include other fields as necessary, like 'extension' or 'topic' if needed
      })
      .select()
      .single();

    if (error) {
      console.log("sendMessage error", error);
      return { success: false, msg: "Could not send message" };
    }

    // Optionally create a notification for the receiver
    await createNotification({
      receiverId: message.receiverId,
      senderId: message.senderId,
      messageId: data.id, // Link to the message
      notificationType: "message",
      content: `${message.senderName} sent you a message.`,
    });

    return { success: true, data: data };
  } catch (error) {
    console.log("sendMessage error", error);
    return { success: false, msg: "Could not send message" };
  }
};

// Function to fetch messages
export const fetchMessages = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`) // Use snake_case column names
      .order("created_at", { ascending: false }); // Make sure this is correct as well

    if (error) {
      console.log("fetchMessages error", error);
      return { success: false, msg: "Could not fetch messages" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("fetchMessages error", error);
    return { success: false, msg: "Could not fetch messages" };
  }
};
