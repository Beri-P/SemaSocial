// services/storageService.js
import { supabase } from '../lib/supabase';

/**
 * Uploads a file to Supabase storage bucket "messages" and returns its public URL.
 * @param {string} path - The folder path (e.g., userId/conversationId/file).
 * @param {File} file - The file object to be uploaded.
 * @returns {Promise<{ url: string | null, error: Error | null }>} - The file URL or an error if failed.
 */
export const uploadFile = async (path, file) => {
  try {
    // Get file extension and construct the file path in the bucket
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}.${fileExt}`;

    // Upload the file to the "messages" bucket
    const { error: uploadError } = await supabase.storage
      .from('messages')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Retrieve the public URL of the uploaded file
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('messages')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
};