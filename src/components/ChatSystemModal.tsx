import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ShieldAlert,
  ShieldCheck,
  CheckCheck,
  ArrowLeft,
  Search,
  Phone,
  CheckCircle2,
  Tag,
  MapPin,
  HandCoins,
} from 'lucide-react';
import { Listing, ChatMessage, ConversationThread, UserProfile } from '../types';
import { formatIndianCurrency } from '../lib/formatters';
import { INITIAL_CONVERSATIONS } from '../data/mockConversations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ChatSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialListing?: Listing | null;
  onUpdateListingStatus?: (listingId: string, status: 'active' | 'sold') => void;
}

export const ChatSystemModal: React.FC<ChatSystemModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialListing,
  onUpdateListingStatus,
}) => {
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [activeConvoId, setActiveConvoId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSafetyBannerDismissed, setIsSafetyBannerDismissed] = useState(false);

  // Mobile split-pane navigation: 'list' | 'thread'
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('thread');

  // Inline "Make an Offer" drawer state
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);
  const [customOfferPrice, setCustomOfferPrice] = useState<number | ''>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If opened with an initial listing (e.g. from "Chat with Seller" on an item)
  useEffect(() => {
    if (initialListing && isOpen) {
      // Check if conversation already exists for this listing
      const existing = conversations.find((c) => c.listingId === initialListing.id);
      if (existing) {
        setActiveConvoId(existing.id);
        setMobileView('thread');
      } else {
        // Create a new conversation thread on the fly
        const newConvo: ConversationThread = {
          id: `convo-${Date.now()}`,
          listingId: initialListing.id,
          listing: initialListing,
          buyerId: currentUser.id,
          sellerId: initialListing.seller.id,
          otherUser: {
            id: initialListing.seller.id,
            name: initialListing.seller.name,
            avatar: initialListing.seller.avatar,
            isVerified: initialListing.seller.isVerified,
            phone: '+91 98480 12345',
            responseTime: initialListing.seller.responseTime,
            city: initialListing.city,
          },
          lastMessage: `Started chat for ${initialListing.title}`,
          lastMessageTime: 'Just now',
          unreadCount: 0,
          sellerSharedPhone: null,
          messages: [
            {
              id: `m-init-${Date.now()}`,
              sender: 'seller',
              content: `Namaste! Thanks for your interest in my ${initialListing.title}. Feel free to ask questions or make an offer.`,
              timestamp: 'Just now',
              is_read: true,
            },
          ],
        };
        setConversations((prev) => [newConvo, ...prev]);
        setActiveConvoId(newConvo.id);
        setMobileView('thread');
      }
    }
  }, [initialListing, isOpen]);

  // Current active conversation
  const activeConvo = conversations.find((c) => c.id === activeConvoId) || conversations[0];

  // Check if current user is the SELLER of this listing
  const isCurrentUserSeller =
    activeConvo &&
    (activeConvo.sellerId === currentUser.id ||
      activeConvo.listing.seller_id === currentUser.id);

  // Supabase Realtime Subscription setup
  useEffect(() => {
    if (!isOpen || !activeConvoId || !isSupabaseConfigured) return;

    // Realtime channel listener for public:messages
    const channel = supabase
      .channel(`realtime:messages:${activeConvoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConvoId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            sender_id: string;
            content: string;
            offer_amount?: number | null;
            created_at: string;
          };

          const isMe = newMsg.sender_id === currentUser.id;
          const formatted: ChatMessage = {
            id: newMsg.id,
            sender: isMe ? 'user' : 'seller',
            content: newMsg.content,
            offer_amount: newMsg.offer_amount,
            isOffer: Boolean(newMsg.offer_amount),
            offer_status: 'pending',
            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            is_read: true,
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConvoId) {
                // Avoid duplicates
                if (c.messages.some((m) => m.id === formatted.id)) return c;
                return {
                  ...c,
                  messages: [...c.messages, formatted],
                  lastMessage: formatted.content,
                  lastMessageTime: 'Just now',
                };
              }
              return c;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, activeConvoId, currentUser.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages, isTyping]);

  if (!isOpen || !activeConvo) return null;

  // Send message
  const handleSendMessage = (text: string, offerAmount?: number) => {
    if (!text.trim() && !offerAmount) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: 'Just now',
      isOffer: Boolean(offerAmount),
      offer_amount: offerAmount,
      offer_status: offerAmount ? 'pending' : undefined,
      is_read: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            lastMessage: offerAmount
              ? `Offer sent: ${formatIndianCurrency(offerAmount)}`
              : text.trim(),
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput('');
    setShowOfferDrawer(false);
    setCustomOfferPrice('');

    // Simulate realistic Realtime seller reply when not connected to cloud backend
    if (!isCurrentUserSeller) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let replyText = `Thanks for your message! Yes, we can meet in ${activeConvo.listing.locality}, ${activeConvo.listing.city}.`;

        if (offerAmount) {
          const discountPct = Math.round(
            ((activeConvo.listing.price - offerAmount) / activeConvo.listing.price) * 100
          );
          if (discountPct <= 10) {
            replyText = `I accept your offer of ${formatIndianCurrency(offerAmount)}! When would you like to inspect the item in ${activeConvo.listing.locality}?`;
          } else {
            replyText = `That is a bit low for this condition, but I can do ${formatIndianCurrency(
              Math.round((activeConvo.listing.price * 0.93) / 100) * 100
            )} if we close today.`;
          }
        } else if (text.toLowerCase().includes('available')) {
          replyText = `Yes, it's 100% available and ready for inspection. Would you like to schedule a meetup?`;
        } else if (text.toLowerCase().includes('meet')) {
          replyText = `We can meet in public near ${activeConvo.listing.locality} main junction. Let me know what time works for you.`;
        }

        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'seller',
          content: replyText,
          timestamp: 'Just now',
          is_read: true,
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConvo.id) {
              return {
                ...c,
                lastMessage: replyText,
                lastMessageTime: 'Just now',
                messages: [...c.messages, replyMsg],
              };
            }
            return c;
          })
        );
      }, 1300);
    }
  };

  // Seller Quick Action: Toggle Mark as Sold
  const handleToggleSold = () => {
    const newStatus = activeConvo.listing.status === 'sold' ? 'active' : 'sold';
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            listing: { ...c.listing, status: newStatus },
            messages: [
              ...c.messages,
              {
                id: `sys-${Date.now()}`,
                sender: 'seller',
                content:
                  newStatus === 'sold'
                    ? '🏷️ This item has been marked as SOLD by the seller.'
                    : '🔄 This listing was reactivated as AVAILABLE.',
                timestamp: 'Just now',
                is_read: true,
              },
            ],
          };
        }
        return c;
      })
    );

    if (onUpdateListingStatus) {
      onUpdateListingStatus(activeConvo.listing.id, newStatus);
    }
  };

  // Seller Quick Action: Share Phone Number (DPDP privacy compliance)
  const handleSharePhone = () => {
    const sellerPhone = currentUser.email?.startsWith('+91')
      ? currentUser.email
      : '+91 98480 87654';

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            sellerSharedPhone: sellerPhone,
            messages: [
              ...c.messages,
              {
                id: `phone-${Date.now()}`,
                sender: 'seller',
                content: `Shared seller contact number for in-person meetup: ${sellerPhone}`,
                timestamp: 'Just now',
                is_phone_share: true,
                shared_phone: sellerPhone,
                is_read: true,
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Handle Offer Response (Accept / Decline)
  const handleOfferResponse = (msgId: string, status: 'accepted' | 'declined') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, offer_status: status } : m
            ),
          };
        }
        return c;
      })
    );

    const confirmationText =
      status === 'accepted'
        ? '✅ Offer Accepted! Please arrange a safe public meetup to inspect and exchange.'
        : '❌ Offer was politely declined. You may submit another offer.';

    setTimeout(() => {
      handleSendMessage(confirmationText);
    }, 400);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (c) =>
      c.listing.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.otherUser.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-dark-card border border-dark-border sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Split Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-dark-border bg-dark-cardElevated/80 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button to list */}
            {mobileView === 'thread' && (
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 rounded-lg text-dark-muted hover:text-dark-text bg-dark-card border border-dark-border"
                aria-label="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                RIO Chat
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
                Realtime
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* ============================================================== */}
          {/* LEFT PANE: Conversations Inbox List (Desktop visible, mobile conditional) */}
          {/* ============================================================== */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-dark-border bg-dark-bg/60 flex flex-col shrink-0 ${
              mobileView === 'list' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Search Inbox */}
            <div className="p-3 border-b border-dark-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-muted" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search chats or listings..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-dark-border/60">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-dark-muted text-xs">
                  No conversations match your search.
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const isSelected = convo.id === activeConvo.id;
                  return (
                    <div
                      key={convo.id}
                      onClick={() => {
                        setActiveConvoId(convo.id);
                        setMobileView('thread');
                      }}
                      className={`p-3.5 flex gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-emerald/10 border-l-4 border-brand-emerald'
                          : 'hover:bg-dark-cardElevated/50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={convo.otherUser.avatar}
                          alt={convo.otherUser.name}
                          className="w-11 h-11 rounded-full object-cover border border-dark-border"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-emerald ring-2 ring-dark-card"></span>
                      </div>

                      {/* Content Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-dark-text truncate flex items-center gap-1">
                            <span>{convo.otherUser.name}</span>
                            {convo.otherUser.isVerified && (
                              <ShieldCheck className="w-3 h-3 text-brand-emerald shrink-0" />
                            )}
                          </h4>
                          <span className="text-[10px] text-dark-muted shrink-0">
                            {convo.lastMessageTime}
                          </span>
                        </div>

                        {/* Listing Title & Price Snapshot */}
                        <div className="flex items-center gap-1.5 text-[11px] text-dark-muted mb-1 truncate">
                          <span className="text-brand-emerald font-bold shrink-0">
                            {formatIndianCurrency(convo.listing.price)}
                          </span>
                          <span>•</span>
                          <span className="truncate">{convo.listing.title}</span>
                        </div>

                        {/* Last message */}
                        <p className="text-[11px] text-dark-muted truncate leading-relaxed">
                          {convo.lastMessage}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {convo.unreadCount > 0 && (
                        <div className="self-center">
                          <span className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[10px] font-bold flex items-center justify-center shadow">
                            {convo.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT PANE: Active Chat Thread View */}
          {/* ============================================================== */}
          <div
            className={`flex-1 flex flex-col bg-dark-bg/40 overflow-hidden ${
              mobileView === 'thread' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Thread Header: Participant info + Seller Quick Actions */}
            <div className="p-3 sm:px-4 sm:py-3 border-b border-dark-border bg-dark-card/90 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activeConvo.otherUser.avatar}
                    alt={activeConvo.otherUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-brand-emerald"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-emerald ring-2 ring-dark-card"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-dark-text truncate">
                      {activeConvo.otherUser.name}
                    </h4>
                    {activeConvo.otherUser.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-dark-muted truncate">
                    {activeConvo.otherUser.responseTime} • {activeConvo.listing.city}
                  </p>
                </div>
              </div>

              {/* Seller Quick Actions (shown when current user is seller) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isCurrentUserSeller ? (
                  <>
                    {/* Share Phone Button (DPDP Privacy Compliant) */}
                    <button
                      onClick={handleSharePhone}
                      className="px-2.5 py-1.5 rounded-xl border border-brand-emerald/40 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Share contact number safely"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share Phone Number</span>
                    </button>

                    {/* Mark as Sold Button */}
                    <button
                      onClick={handleToggleSold}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                        activeConvo.listing.status === 'sold'
                          ? 'border-brand-emerald/40 text-brand-emerald bg-brand-emerald/5'
                          : 'border-brand-amber/40 text-brand-amber bg-brand-amber/10 hover:bg-brand-amber/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {activeConvo.listing.status === 'sold' ? 'Reactivate' : 'Mark as Sold'}
                      </span>
                    </button>
                  </>
                ) : (
                  /* Buyer View: Show Seller Phone if shared */
                  activeConvo.sellerSharedPhone && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{activeConvo.sellerSharedPhone}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 1. Pinned Item Card at Top of Chat */}
            <div className="px-4 py-2.5 bg-dark-cardElevated/60 border-b border-dark-border flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeConvo.listing.images[0]}
                  alt={activeConvo.listing.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-dark-border"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-extrabold text-white">
                      {formatIndianCurrency(activeConvo.listing.price)}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        activeConvo.listing.status === 'sold'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30'
                      }`}
                    >
                      {activeConvo.listing.status}
                    </span>
                    {activeConvo.listing.isNegotiable && (
                      <span className="text-[10px] text-brand-amber font-medium hidden sm:inline">
                        Negotiable
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-semibold text-dark-text truncate">
                    {activeConvo.listing.title}
                  </h5>
                </div>
              </div>

              <div className="text-[11px] text-dark-muted shrink-0 text-right hidden sm:block">
                <span>{activeConvo.listing.locality}</span>
              </div>
            </div>

            {/* 4. Mandatory Indian Consumer Safety Notice Banner */}
            {!isSafetyBannerDismissed && (
              <div className="px-4 py-2.5 bg-brand-amber/10 border-b border-brand-amber/25 flex items-start justify-between gap-3 shrink-0">
                <div className="flex items-start gap-2 text-xs text-amber-200 leading-snug">
                  <ShieldAlert className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    <strong>Safety Tip:</strong> Meet in a public place and inspect the item before paying. Never scan a QR code or enter your UPI PIN to receive money.
                  </p>
                </div>
                <button
                  onClick={() => setIsSafetyBannerDismissed(true)}
                  className="text-amber-300 hover:text-white p-0.5 shrink-0"
                  aria-label="Dismiss safety banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-dark-bg/20">
              <div className="text-center py-2">
                <span className="px-3 py-1 rounded-full text-[10px] bg-dark-card border border-dark-border text-dark-muted">
                  End-to-end peer encrypted conversation
                </span>
              </div>

              {activeConvo.messages.map((msg) => {
                const isMe = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Render Structured Offer Card if this message is an offer */}
                    {msg.isOffer && msg.offer_amount ? (
                      <div className="max-w-sm w-full rounded-2xl bg-gradient-to-br from-dark-card to-dark-cardElevated border-2 border-brand-amber p-4 shadow-lg space-y-3 my-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand-amber flex items-center gap-1">
                            <HandCoins className="w-3.5 h-3.5" />
                            Official Price Offer
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              msg.offer_status === 'accepted'
                                ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40'
                                : msg.offer_status === 'declined'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {msg.offer_status || 'Pending'}
                          </span>
                        </div>

                        <div>
                          <span className="text-2xl font-black text-white">
                            {formatIndianCurrency(msg.offer_amount)}
                          </span>
                          <p className="text-xs text-dark-muted mt-0.5">
                            Original Listed Price: {formatIndianCurrency(activeConvo.listing.price)}
                          </p>
                        </div>

                        {/* Accept / Decline actions for the recipient */}
                        {!isMe && msg.offer_status === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleOfferResponse(msg.id, 'accepted')}
                              className="flex-1 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-emeraldDark transition-all"
                            >
                              Accept Offer
                            </button>
                            <button
                              onClick={() => handleOfferResponse(msg.id, 'declined')}
                              className="flex-1 py-1.5 rounded-xl border border-dark-border text-dark-muted hover:text-rose-400 text-xs font-semibold transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ) : msg.is_phone_share && msg.shared_phone ? (
                      /* Phone Share Card */
                      <div className="max-w-xs rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 p-3.5 my-1 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-brand-emerald font-bold text-xs">
                          <Phone className="w-4 h-4" />
                          <span>Contact Shared</span>
                        </div>
                        <p className="text-sm font-extrabold text-white tracking-wide">
                          {msg.shared_phone}
                        </p>
                        <p className="text-[10px] text-dark-muted">
                          Meet in person at public place in {activeConvo.listing.locality}.
                        </p>
                      </div>
                    ) : (
                      /* Standard Text Bubble */
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-brand-emerald text-white rounded-br-xs'
                            : 'bg-dark-card border border-dark-border text-dark-text rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-dark-muted">{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-brand-emerald" />}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-dark-muted italic px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping"></span>
                  <span>{activeConvo.otherUser.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 2. Quick Negotiation Chips (One-tap action chips) */}
            <div className="p-2 bg-dark-card border-t border-dark-border flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {/* Chip 1: Availability */}
              <button
                onClick={() => handleSendMessage('Is this still available?')}
                className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl border border-dark-border bg-dark-cardElevated hover:border-brand-emerald/60 hover:text-brand-emerald text-dark-text font-medium transition-all shrink-0"
              >
                Is this still available?
              </button>

              {/* Chip 2: Make an Offer (opens inline offer drawer) */}
              <button
                onClick={() => setShowOfferDrawer((prev) => !prev)}
                className={`text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition-all shrink-0 ${
                  showOfferDrawer
                    ? 'border-brand-amber bg-brand-amber text-black shadow-md'
                    : 'border-brand-amber/50 bg-brand-amber/10 text-brand-amber hover:bg-brand-amber/20'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>Make an Offer</span>
              </button>

              {/* Chip 3: Meeting Location */}
              <button
                onClick={() =>
                  handleSendMessage(`Where can we meet in ${activeConvo.listing.locality}?`)
                }
                className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl border border-dark-border bg-dark-cardElevated hover:border-brand-emerald/60 hover:text-brand-emerald text-dark-text font-medium transition-all shrink-0 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-brand-emerald" />
                <span>Where can we meet?</span>
              </button>
            </div>

            {/* Inline Make an Offer Input Drawer */}
            {showOfferDrawer && (
              <div className="p-3.5 bg-dark-cardElevated/90 border-t border-dark-border animate-fadeIn space-y-2.5 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-dark-text flex items-center gap-1.5">
                    <HandCoins className="w-4 h-4 text-brand-amber" />
                    Enter Custom Offer for {activeConvo.listing.title}
                  </span>
                  <span className="text-dark-muted">
                    Listing Price: {formatIndianCurrency(activeConvo.listing.price)}
                  </span>
                </div>

                {/* Quick % discount presets */}
                <div className="flex gap-2">
                  {[0.95, 0.9, 0.85].map((factor) => {
                    const preset = Math.round((activeConvo.listing.price * factor) / 100) * 100;
                    return (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => setCustomOfferPrice(preset)}
                        className="flex-1 py-1 px-2 rounded-lg bg-dark-card border border-dark-border hover:border-brand-amber text-xs font-semibold text-brand-amber transition-colors text-center"
                      >
                        {formatIndianCurrency(preset)} (-{Math.round((1 - factor) * 100)}%)
                      </button>
                    );
                  })}
                </div>

                {/* Custom numeric offer submit bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-emerald">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={customOfferPrice}
                      onChange={(e) =>
                        setCustomOfferPrice(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="Enter amount (e.g. 75000)"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (customOfferPrice && Number(customOfferPrice) > 0) {
                        handleSendMessage(
                          `Official Offer submitted: ${formatIndianCurrency(
                            Number(customOfferPrice)
                          )}`,
                          Number(customOfferPrice)
                        );
                      }
                    }}
                    disabled={!customOfferPrice || Number(customOfferPrice) <= 0}
                    className="px-4 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-emerald/20"
                  >
                    Send Offer
                  </button>
                </div>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(messageInput);
              }}
              className="p-3 bg-dark-card border-t border-dark-border flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message to the seller..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand-emerald transition-all"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-xl bg-brand-emerald text-white hover:bg-brand-emeraldDark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-emerald/20"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
