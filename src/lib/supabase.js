import { createClient } from '@supabase/supabase-js';
import { initializeAI } from './ai-service';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  storage: {
    retryAttempts: 3,
    retryDelay: 500,
  },
});

export async function signInWithEmail(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email, password, displayName = null) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (authError) throw authError;

    // Create or update the user's profile with display name
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email,
          display_name: displayName || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here as the user is already created
      }
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      // Get user profile data including API key
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return user;
      }

      if (profile?.openai_api_key) {
        // Store API key in localStorage
        localStorage.setItem('openai_api_key', profile.openai_api_key);
        // Initialize AI service with the key
        initializeAI(profile.openai_api_key);
      } else {
        // If no API key in profile but exists in localStorage, save it to profile
        const localApiKey = localStorage.getItem('openai_api_key');
        if (localApiKey) {
          await updateUserApiKey(user.id, localApiKey);
        }
      }
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
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

export async function saveSubscription(userId, subscriptionData) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: subscriptionData.plan,
        credits_used: subscriptionData.creditsUsed || 0,
        current_period_start: subscriptionData.currentPeriodStart.toISOString(),
        current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
        status: subscriptionData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveSubscription:', error);
    throw error;
  }
}

export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
}

export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
} 