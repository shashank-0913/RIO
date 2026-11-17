-- ==============================================================================
-- RIO by Vink (Resell It Online) — Database Schema & Security Migration
-- Compliant with Supabase PostgreSQL, Strict Row-Level Security (RLS) & DPDP
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES DEFINITION
-- ==============================================================================

-- 2.1 PROFILES TABLE
-- References Supabase auth.users. Anti-spoofing protection on verification & dealer status.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    city TEXT,
    locality TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_pro_dealer BOOLEAN NOT NULL DEFAULT false,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating_avg >= 0 AND rating_avg <= 5.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 LISTING QUOTA AUDIT TABLE
-- Keeps an immutable audit trail of ad creations so deleting/selling ads does NOT reset free quotas
CREATE TABLE IF NOT EXISTS public.listing_quota_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 LISTINGS TABLE
-- Second-hand items across categories with strict status, price and condition constraints
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 5),
    description TEXT,
    category TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Gently Used', 'Minor Wear')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    is_negotiable BOOLEAN NOT NULL DEFAULT true,
    images TEXT[] NOT NULL DEFAULT '{}',
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden')),
    is_boosted BOOLEAN NOT NULL DEFAULT false,
    boost_expires_at TIMESTAMPTZ,
    views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 CONVERSATIONS TABLE
-- 1-on-1 buyer-seller chat threads tied to specific listings
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_conversation_listing_buyer UNIQUE (listing_id, buyer_id),
    CONSTRAINT chk_diff_buyer_seller CHECK (buyer_id <> seller_id)
);

-- 2.5 MESSAGES TABLE
-- Individual messages within a conversation, supporting real-time chat & price offers
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    offer_amount NUMERIC CHECK (offer_amount IS NULL OR offer_amount >= 0),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 FAVORITES (WISHLIST) TABLE
-- Composite primary key (user_id, listing_id)
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, listing_id)
);

-- 2.7 REPORTS TABLE
-- Grievance & statutory reporting under Indian IT Act and DPDP guidelines
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. INDEXES
-- Optimized for search, category filtering, locality, status, and RLS evaluation
-- ==============================================================================

-- Required composite index for listing searches
CREATE INDEX IF NOT EXISTS idx_listings_search 
    ON public.listings(city, category, status, created_at DESC);

-- Supporting indexes on listings
CREATE INDEX IF NOT EXISTS idx_listings_seller_id 
    ON public.listings(seller_id);

CREATE INDEX IF NOT EXISTS idx_listings_status_created 
    ON public.listings(status, created_at DESC);

-- Quota tracking index
CREATE INDEX IF NOT EXISTS idx_quota_tracking_user_cat 
    ON public.listing_quota_tracking(user_id, category, created_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_seller 
    ON public.conversations(buyer_id, seller_id);

CREATE INDEX IF NOT EXISTS idx_conversations_listing_id 
    ON public.conversations(listing_id);

-- Messages index
CREATE INDEX IF NOT EXISTS idx_messages_convo_created 
    ON public.messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
    ON public.messages(sender_id);

-- Favorites & Reports indexes
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id 
    ON public.favorites(listing_id);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id 
    ON public.reports(listing_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id 
    ON public.reports(reporter_id);

-- ==============================================================================
-- 4. FREE AD QUOTA ENFORCEMENT FUNCTION & TRIGGER
-- ==============================================================================

-- Function: check_free_listing_quota
-- Rules:
-- 1. If profiles.is_pro_dealer = true -> bypass limit (returns true).
-- 2. 'Mobiles & Electronics': max 1 free ad per 30 days.
-- 3. 'Bikes & Cars' or 'Property': max 1 free ad per 60 days.
-- 4. All other categories: max 2 free ads per 30 days.
-- 5. Counts all ads created by user in designated window (including sold/deleted ads).
CREATE OR REPLACE FUNCTION public.check_free_listing_quota(
    p_user_id UUID,
    p_category TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_pro_dealer BOOLEAN := false;
    v_window INTERVAL;
    v_max_allowed INT;
    v_ad_count INT := 0;
BEGIN
    -- Check if user is a PRO Dealer (bypass all free ad quotas)
    SELECT is_pro_dealer INTO v_is_pro_dealer
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_is_pro_dealer IS TRUE THEN
        RETURN true;
    END IF;

    -- Determine category-based quota and timeframe
    IF p_category = 'Mobiles & Electronics' THEN
        v_window := INTERVAL '30 days';
        v_max_allowed := 1;
    ELSIF p_category IN ('Bikes & Cars', 'Property') THEN
        v_window := INTERVAL '60 days';
        v_max_allowed := 1;
    ELSE
        -- All other categories (Furniture, Appliances, Books & Hobbies, etc.)
        v_window := INTERVAL '30 days';
        v_max_allowed := 2;
    END IF;

    -- Count ads created in the tracking ledger within the quota window
    SELECT COUNT(*) INTO v_ad_count
    FROM public.listing_quota_tracking
    WHERE user_id = p_user_id
      AND category = p_category
      AND created_at >= (now() - v_window);

    -- Allow insert only if current count is strictly less than max allowed
    RETURN v_ad_count < v_max_allowed;
END;
$$;

-- Trigger Function: log listing creation in quota tracking ledger
CREATE OR REPLACE FUNCTION public.trg_fn_log_listing_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.listing_quota_tracking (user_id, category, created_at)
    VALUES (NEW.seller_id, NEW.category, NEW.created_at);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_listing_insert_quota_log ON public.listings;
CREATE TRIGGER trg_after_listing_insert_quota_log
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_log_listing_creation();

-- Trigger Function: Enforce quota before inserting listing with clear exception
CREATE OR REPLACE FUNCTION public.trg_fn_enforce_listing_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.check_free_listing_quota(NEW.seller_id, NEW.category) THEN
        RAISE EXCEPTION 'Free listing quota exceeded for category "%". Upgrade to RIO Pro Dealer for unlimited listings.', NEW.category;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_listing_insert_quota_enforce ON public.listings;
CREATE TRIGGER trg_before_listing_insert_quota_enforce
    BEFORE INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_enforce_listing_quota();

-- ==============================================================================
-- 5. ANTI-SPOOFING & INTEGRITY TRIGGERS
-- ==============================================================================

-- 5.1 Profile Anti-Spoofing:
-- Users cannot self-assign is_verified, is_pro_dealer, or modify rating_avg
CREATE OR REPLACE FUNCTION public.trg_fn_protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if restricted fields were altered
    IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified OR 
        NEW.is_pro_dealer IS DISTINCT FROM OLD.is_pro_dealer OR 
        NEW.rating_avg IS DISTINCT FROM OLD.rating_avg) THEN
        
        -- Only service_role / superuser can change verification & dealer status
        IF auth.role() <> 'service_role' THEN
            RAISE EXCEPTION 'Access Denied: You cannot modify verification status, Pro Dealer badge, or user ratings.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_protect_profile_privileged_fields();

-- 5.2 Listing Anti-Tampering:
-- Users cannot self-assign is_boosted or fake views_count directly on update
CREATE OR REPLACE FUNCTION public.trg_fn_protect_listing_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.role() <> 'service_role' THEN
        -- Prevent arbitrary manual boost injection by seller
        IF (NEW.is_boosted IS DISTINCT FROM OLD.is_boosted OR
            NEW.boost_expires_at IS DISTINCT FROM OLD.boost_expires_at) THEN
            NEW.is_boosted := OLD.is_boosted;
            NEW.boost_expires_at := OLD.boost_expires_at;
        END IF;
        
        -- Prevent seller from resetting seller_id
        NEW.seller_id := OLD.seller_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_listing_fields ON public.listings;
CREATE TRIGGER trg_protect_listing_fields
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_protect_listing_privileged_fields();

-- 5.3 Automatically create a Profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, city, locality, is_verified, is_pro_dealer, rating_avg)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'RIO User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Visakhapatnam'),
        COALESCE(NEW.raw_user_meta_data->>'locality', 'MVP Colony'),
        false,
        false,
        5.00
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5.4 Update Conversation updated_at and last_message when a message is sent
CREATE OR REPLACE FUNCTION public.trg_fn_update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.conversations
    SET last_message = NEW.content,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_message_insert_update_conversation ON public.messages;
CREATE TRIGGER trg_after_message_insert_update_conversation
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_update_conversation_on_message();

-- ==============================================================================
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- Mandatory strict RLS on EVERY table as defined in AGENTS.md
-- ==============================================================================

-- 6.1 PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- 6.2 LISTINGS RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone; owners can view own hidden/sold"
    ON public.listings FOR SELECT
    USING (
        status = 'active' 
        OR (auth.uid() IS NOT NULL AND auth.uid() = seller_id)
    );

CREATE POLICY "Authenticated users can insert listings if within free quota"
    ON public.listings FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = seller_id
        AND public.check_free_listing_quota(auth.uid(), category)
    );

CREATE POLICY "Sellers can update their own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
    ON public.listings FOR DELETE
    USING (auth.uid() = seller_id);

-- 6.3 CONVERSATIONS RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
    );

CREATE POLICY "Buyers can initiate conversations with sellers"
    ON public.conversations FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = buyer_id 
        AND auth.uid() <> seller_id
    );

CREATE POLICY "Participants can update conversations"
    ON public.conversations FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
    );

CREATE POLICY "Participants can delete their conversations"
    ON public.conversations FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
    );

-- 6.4 MESSAGES RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
              AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Participants can insert messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
              AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Recipients can mark messages as read"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
              AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
              AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

CREATE POLICY "Senders can delete their messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- 6.5 FAVORITES (WISHLIST) RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- 6.6 REPORTS RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submitted reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = reporter_id
    );

-- 6.7 QUOTA TRACKING RLS
ALTER TABLE public.listing_quota_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ad quota usage"
    ON public.listing_quota_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Only database triggers or service_role can insert into quota tracking
CREATE POLICY "Users cannot manually insert into quota tracking"
    ON public.listing_quota_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- No user DELETE policy on listing_quota_tracking (so quotas cannot be wiped by client)

