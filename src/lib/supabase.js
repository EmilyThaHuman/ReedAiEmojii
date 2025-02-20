import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithEmail(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Get user profile data including API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile?.openai_api_key) {
      localStorage.setItem('openai_api_key', profile.openai_api_key);
    }
  }
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function updateUserApiKey(userId, apiKey) {
  return await supabase
    .from('profiles')
    .upsert({
      id: userId,
      openai_api_key: apiKey,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    });
}

export async function uploadEmojiImage(userId, imageUrl, fileName) {
  try {
    // Convert image URL to base64
    const base64Data = imageUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data');
    }

    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/png' });

    // Generate a unique file name with user ID as the folder
    const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const uniqueFileName = `${userId}/${sanitizedFileName}-${Date.now()}.png`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('emoji_images')
      .upload(uniqueFileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('emoji_images')
      .getPublicUrl(uniqueFileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading emoji image:', error);
    throw error;
  }
}

export async function deleteEmojiImage(imagePath) {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(imagePath);
    const pathSegments = urlObj.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf('emoji_images') + 1).join('/');

    const { error } = await supabase.storage
      .from('emoji_images')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting emoji image:', error);
    throw error;
  }
}

export async function saveEmoji(userId, description, imageUrl) {
  try {
    // Upload the image to storage first
    const storedImageUrl = await uploadEmojiImage(
      userId,
      imageUrl,
      description
    );

    // Save the emoji record with the storage URL
    const { data, error } = await supabase
      .from('emojis')
      .insert({
        user_id: userId,
        description,
        image_url: storedImageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Emoji insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to save emoji: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from emoji insert');
    }

    return data;
  } catch (error) {
    console.error('Error saving emoji:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
}

export async function getUserEmojis(userId) {
  try {
    const { data, error } = await supabase
      .from('emojis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching emojis:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to fetch emojis: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserEmojis:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
}

export async function deleteEmoji(emojiId) {
  try {
    // Get the emoji record first to get the image URL
    const { data: emoji } = await supabase
      .from('emojis')
      .select('image_url')
      .eq('id', emojiId)
      .single();

    if (emoji) {
      // Delete the image from storage
      await deleteEmojiImage(emoji.image_url);
    }

    // Delete the emoji record
    const { error } = await supabase
      .from('emojis')
      .delete()
      .eq('id', emojiId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting emoji:', error);
    throw error;
  }
} 