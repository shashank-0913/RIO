import React from 'react';
import { ChatSystemModal } from './ChatSystemModal';
import { Listing, UserProfile } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  currentUser?: UserProfile;
  onUpdateListingStatus?: (listingId: string, status: 'active' | 'sold') => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  onUpdateListingStatus,
}) => {
  const user = currentUser || {
    id: 'usr-demo-101',
    full_name: 'Pavan Varma',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    city: 'Visakhapatnam',
    locality: 'MVP Colony',
    is_verified: true,
    is_pro_dealer: false,
    rating_avg: 5.0,
  };

  return (
    <ChatSystemModal
      isOpen={isOpen}
      onClose={onClose}
      currentUser={user}
      initialListing={listing}
      onUpdateListingStatus={onUpdateListingStatus}
    />
  );
};
