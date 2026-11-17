export type CategoryType =
  | 'All'
  | 'Mobiles & Electronics'
  | 'Bikes & Cars'
  | 'Furniture'
  | 'Appliances'
  | 'Books & Hobbies'
  | 'Property';

export type ConditionType = 'Like New' | 'Gently Used' | 'Minor Wear' | 'Brand New';

export type ListingStatus = 'active' | 'sold' | 'hidden';

export type CityType =
  | 'Visakhapatnam'
  | 'Hyderabad'
  | 'Bengaluru'
  | 'Mumbai'
  | 'Delhi NCR'
  | 'Chennai'
  | 'Pune';

export type RadiusType = '5 km' | '10 km' | 'City-wide' | 'All India';

export type SortType = 'newest' | 'nearest' | 'price-low-high' | 'price-high-low';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url: string;
  city: CityType;
  locality: string;
  is_verified: boolean;
  is_pro_dealer: boolean;
  rating_avg: number;
  reviews_count?: number;
  created_at?: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  verificationBadges: string[];
  responseTime: string;
  city: CityType;
}

export interface Listing {
  id: string;
  seller_id?: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  isNegotiable: boolean;
  category: CategoryType;
  condition: ConditionType;
  city: CityType;
  locality: string;
  distanceKm: number;
  images: string[];
  createdAt: string;
  specs: Record<string, string>;
  seller: Seller;
  status: ListingStatus;
  isFeatured?: boolean;
  is_boosted?: boolean;
  boost_expires_at?: string;
  viewsCount: number;
  likesCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'offer' | 'price_drop' | 'chat' | 'system';
  listingId?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  sender: 'user' | 'seller';
  content: string;
  text?: string; // backwards compatibility
  timestamp: string;
  created_at?: string;
  isOffer?: boolean;
  offerAmount?: number;
  offer_amount?: number | null;
  offer_status?: 'pending' | 'accepted' | 'declined';
  is_read?: boolean;
  is_phone_share?: boolean;
  shared_phone?: string;
}

export interface ConversationThread {
  id: string;
  listingId: string;
  listing: Listing;
  buyerId: string;
  sellerId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    phone?: string;
    responseTime?: string;
    city?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  sellerSharedPhone?: string | null;
}

export interface QuotaStatus {
  category: CategoryType;
  windowDays: number;
  maxAllowed: number;
  currentUsed: number;
  remaining: number;
  isAllowed: boolean;
  isProDealer: boolean;
}

export interface QuotaStatus {
  category: CategoryType;
  windowDays: number;
  maxAllowed: number;
  currentUsed: number;
  remaining: number;
  isAllowed: boolean;
  isProDealer: boolean;
}
