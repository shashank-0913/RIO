import { supabase, isSupabaseConfigured } from './supabase';
import { Listing, UserProfile, CategoryType, QuotaStatus } from '../types';
import { MOCK_LISTINGS } from '../data/mockListings';

// Default mock authenticated user for instant preview/offline mode
export const DEMO_USER: UserProfile = {
  id: 'usr-demo-101',
  email: 'pavan.varma@vink.in',
  full_name: 'Pavan Varma',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  city: 'Visakhapatnam',
  locality: 'MVP Colony Sector 3',
  is_verified: true,
  is_pro_dealer: false,
  rating_avg: 4.95,
  reviews_count: 24,
};

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    // Return demo user login for seamless testing without Supabase setup
    return { user: DEMO_USER, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  return { data, error };
}

export async function signInWithEmail(email: string, pass: string) {
  if (!isSupabaseConfigured) {
    // Return mock user if keys aren't set up yet
    const mockUser: UserProfile = {
      ...DEMO_USER,
      email,
      full_name: email.split('@')[0],
    };
    return { profile: mockUser, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) return { profile: null, error: error.message };

  if (data.user) {
    const profile = await fetchUserProfile(data.user.id);
    return { profile, error: null };
  }

  return { profile: null, error: 'User not found' };
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string,
  city: UserProfile['city'],
  locality: string
) {
  if (!isSupabaseConfigured) {
    const mockUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      city,
      locality,
      is_verified: false,
      is_pro_dealer: false,
      rating_avg: 5.0,
      reviews_count: 0,
    };
    return { profile: mockUser, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
        city,
        locality,
      },
    },
  });

  if (error) return { profile: null, error: error.message };

  if (data.user) {
    // Upsert profile in public.profiles table
    const profile: UserProfile = {
      id: data.user.id,
      email,
      full_name: fullName,
      avatar_url: '',
      city,
      locality,
      is_verified: false,
      is_pro_dealer: false,
      rating_avg: 5.0,
      reviews_count: 0,
    };

    await upsertProfile(profile);
    return { profile, error: null };
  }

  return { profile: null, error: 'Failed to create user account' };
}

export async function signOutUser() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return DEMO_USER;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function upsertProfile(profile: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      city: profile.city,
      locality: profile.locality,
      is_verified: profile.is_verified,
      is_pro_dealer: profile.is_pro_dealer,
      rating_avg: profile.rating_avg,
    });

  return !error;
}

// ============================================================================
// STORAGE UPLOAD (listing-images bucket)
// ============================================================================

export async function uploadListingImagesToStorage(
  files: File[],
  userId: string
): Promise<string[]> {
  if (!isSupabaseConfigured) {
    // Return object URLs or high quality mock image fallbacks
    return files.map((f) => URL.createObjectURL(f));
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop() || 'webp';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        contentType: file.type || 'image/webp',
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      if (publicUrlData.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  return uploadedUrls;
}

// ============================================================================
// LISTINGS CRUD
// ============================================================================

export async function fetchLiveListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    return MOCK_LISTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_LISTINGS;
    }

    return data.map((item) => ({
      id: item.id,
      seller_id: item.seller_id,
      title: item.title,
      description: item.description,
      price: Number(item.price),
      isNegotiable: item.is_negotiable,
      category: item.category as CategoryType,
      condition: item.condition,
      city: item.city,
      locality: item.locality,
      distanceKm: 2.5,
      images: item.images && item.images.length > 0 ? item.images : [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80'
      ],
      createdAt: 'Recently',
      specs: item.attributes || {},
      status: item.status,
      isFeatured: item.is_boosted,
      viewsCount: item.views_count,
      likesCount: 0,
      seller: {
        id: item.seller?.id || item.seller_id,
        name: item.seller?.full_name || 'RIO Seller',
        avatar: item.seller?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        memberSince: '2024',
        rating: Number(item.seller?.rating_avg) || 5.0,
        reviewsCount: 12,
        isVerified: Boolean(item.seller?.is_verified),
        verificationBadges: ['Aadhaar KYC', 'Phone Verified'],
        responseTime: 'Replies in 15 mins',
        city: item.seller?.city || item.city,
      },
    }));
  } catch (err) {
    console.warn('Live listings fetch fallback to local data:', err);
    return MOCK_LISTINGS;
  }
}

// ============================================================================
// FREE AD QUOTA CHECKER
// ============================================================================

export function checkCategoryQuota(
  category: CategoryType,
  userListings: Listing[],
  isProDealer: boolean
): QuotaStatus {
  if (isProDealer) {
    return {
      category,
      windowDays: 30,
      maxAllowed: 9999,
      currentUsed: userListings.length,
      remaining: 9999,
      isAllowed: true,
      isProDealer: true,
    };
  }

  let windowDays = 30;
  let maxAllowed = 2;

  if (category === 'Mobiles & Electronics') {
    windowDays = 30;
    maxAllowed = 1;
  } else if (category === 'Bikes & Cars' || category === 'Property') {
    windowDays = 60;
    maxAllowed = 1;
  } else {
    windowDays = 30;
    maxAllowed = 2;
  }

  // Count listings by this user in this category
  const used = userListings.filter((l) => l.category === category).length;
  const remaining = Math.max(0, maxAllowed - used);

  return {
    category,
    windowDays,
    maxAllowed,
    currentUsed: used,
    remaining,
    isAllowed: used < maxAllowed,
    isProDealer: false,
  };
}

