import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Lock,
} from 'lucide-react';
import { Listing, CategoryType, ConditionType, CityType, UserProfile, QuotaStatus } from '../types';
import { CITIES, MOCK_LOCALITIES } from '../data/mockListings';
import { formatIndianCurrency } from '../lib/formatters';
import { compressMultipleImages, CompressedImageResult } from '../lib/imageCompression';
import { checkCategoryQuota, uploadListingImagesToStorage } from '../lib/api';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: Listing) => void;
  defaultCity: CityType;
  currentUser: UserProfile;
  userListings: Listing[];
  onTriggerPaywall: (status: QuotaStatus) => void;
}

const CATEGORIES: CategoryType[] = [
  'Mobiles & Electronics',
  'Bikes & Cars',
  'Furniture',
  'Appliances',
  'Books & Hobbies',
  'Property',
];

const CONDITIONS: ConditionType[] = ['Like New', 'Gently Used', 'Minor Wear', 'Brand New'];

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  defaultCity,
  currentUser,
  userListings,
  onTriggerPaywall,
}) => {
  const [category, setCategory] = useState<CategoryType>('Mobiles & Electronics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [condition, setCondition] = useState<ConditionType>('Like New');
  const [city, setCity] = useState<CityType>(defaultCity);
  const [locality, setLocality] = useState(MOCK_LOCALITIES[defaultCity]?.[0] || 'MVP Colony');

  // Category specific attributes
  const [catAttributes, setCatAttributes] = useState<Record<string, string>>({});

  // Image upload & compression state
  const [compressedImages, setCompressedImages] = useState<CompressedImageResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate current quota for selected category
  const quotaStatus = checkCategoryQuota(category, userListings, currentUser.is_pro_dealer);

  // Initialize dynamic fields based on category
  useEffect(() => {
    switch (category) {
      case 'Mobiles & Electronics':
        setCatAttributes({
          Brand: 'Apple',
          Storage: '128 GB',
          RAM: '8 GB',
          'Bill & Box': 'Available with original invoice',
          Warranty: 'Active brand warranty',
        });
        break;
      case 'Bikes & Cars':
        setCatAttributes({
          'Model Year': '2023',
          'KM Driven': '8,500 km',
          'Ownership': '1st Owner',
          'Fuel Type': 'Petrol',
          'Insurance': 'Comprehensive Valid till 2027',
        });
        break;
      case 'Furniture':
        setCatAttributes({
          Material: 'Solid Teak Wood',
          'Seating / Type': 'Dining Set with 6 Chairs',
          Dimensions: '180cm x 90cm x 75cm',
          Age: '1 Year Old',
        });
        break;
      case 'Appliances':
        setCatAttributes({
          Brand: 'LG',
          Capacity: '260 Litres',
          'Energy Star': '5 Star BEE Inverter',
          Warranty: 'Compressor Under Brand Warranty',
        });
        break;
      case 'Books & Hobbies':
        setCatAttributes({
          Type: 'UPSC Civil Services Complete GS Notes',
          Edition: 'Latest 2024-2025 Edition',
          Condition: 'Clean, unmarked pages',
        });
        break;
      case 'Property':
        setCatAttributes({
          'Super Built-up Area': '1,350 sq.ft',
          Configuration: '2 BHK Sea-Facing',
          Furnishing: 'Fully Furnished Modular Kitchen',
          Facing: 'East (Bay of Bengal view)',
        });
        break;
      default:
        setCatAttributes({});
    }
  }, [category]);

  if (!isOpen) return null;

  const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const remainingSlots = 6 - compressedImages.length;
    if (remainingSlots <= 0) {
      alert('You can upload up to 6 photos per listing.');
      return;
    }

    const filesToCompress = files.slice(0, remainingSlots);
    setIsCompressing(true);
    setCompressionProgress(`Compressing ${filesToCompress.length} images to max 200KB WebP...`);

    try {
      const results = await compressMultipleImages(filesToCompress, (current, total) => {
        setCompressionProgress(`Compressing photo ${current} of ${total}...`);
      });

      setCompressedImages((prev) => [...prev, ...results]);
    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
      setCompressionProgress('');
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setCompressedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || Number(price) <= 0) return;

    // Check free quota limit
    if (!quotaStatus.isAllowed) {
      onTriggerPaywall(quotaStatus);
      return;
    }

    setIsPublishing(true);

    try {
      // Upload compressed images to Supabase storage or get preview URLs
      let finalImageUrls: string[] = [];
      if (compressedImages.length > 0) {
        finalImageUrls = await uploadListingImagesToStorage(
          compressedImages.map((c) => c.file),
          currentUser.id
        );
      }

      if (finalImageUrls.length === 0) {
        finalImageUrls = [getDefaultImage(category)];
      }

      const newListing: Listing = {
        id: `rio-${Date.now()}`,
        seller_id: currentUser.id,
        title: title.trim(),
        description: description.trim() || 'Verified peer-to-peer listing on RIO by Vink.',
        price: Number(price),
        isNegotiable,
        category,
        condition,
        city,
        locality,
        distanceKm: 1.5,
        images: finalImageUrls,
        createdAt: 'Just now',
        specs: catAttributes,
        seller: {
          id: currentUser.id,
          name: currentUser.full_name,
          avatar: currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          memberSince: 'Today',
          rating: currentUser.rating_avg,
          reviewsCount: currentUser.reviews_count || 1,
          isVerified: currentUser.is_verified,
          verificationBadges: currentUser.is_verified
            ? ['Aadhaar KYC', 'Phone Verified']
            : ['Phone Verified'],
          responseTime: 'Replies within 10 mins',
          city,
        },
        status: 'active',
        isFeatured: false,
        viewsCount: 1,
        likesCount: 0,
      };

      onAddListing(newListing);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsPublishing(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Publish error:', err);
      setIsPublishing(false);
    }
  };

  const getDefaultImage = (cat: CategoryType): string => {
    switch (cat) {
      case 'Mobiles & Electronics':
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80';
      case 'Bikes & Cars':
        return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80';
      case 'Furniture':
        return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80';
      case 'Appliances':
        return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80';
      case 'Books & Hobbies':
        return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80';
      case 'Property':
        return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
      default:
        return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-dark-border bg-dark-cardElevated/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-emerald/10 text-brand-emerald">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dark-text">List Item on RIO by Vink</h3>
              <p className="text-xs text-dark-muted">Verified marketplace listing across {city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Ad Quota Indicator Banner */}
        <div
          className={`px-5 py-2.5 flex items-center justify-between border-b text-xs ${
            quotaStatus.isAllowed
              ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald'
              : 'bg-brand-amber/15 border-brand-amber/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {quotaStatus.isAllowed ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-brand-emerald" />
            ) : (
              <Lock className="w-4 h-4 shrink-0 text-brand-amber" />
            )}
            <span>
              <strong>{category} Quota:</strong> {quotaStatus.currentUsed} of {quotaStatus.maxAllowed} free ads used ({quotaStatus.remaining} remaining this {quotaStatus.windowDays}-day cycle)
            </span>
          </div>

          {!quotaStatus.isAllowed && (
            <button
              type="button"
              onClick={() => onTriggerPaywall(quotaStatus)}
              className="px-2.5 py-1 rounded-lg bg-brand-amber text-black font-bold text-[10px] uppercase tracking-wide hover:brightness-110 shrink-0 ml-2"
            >
              Unlock Slot
            </button>
          )}
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3 my-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald/15 text-brand-emerald flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white">Listing Published Live on RIO!</h4>
            <p className="text-xs text-dark-muted max-w-sm mx-auto">
              Photos compressed to WebP and published to the {city} marketplace feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Category Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-2">
                1. Select Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left truncate transition-all ${
                      category === cat
                        ? 'border-brand-emerald bg-brand-emerald/15 text-brand-emerald font-bold shadow-sm'
                        : 'border-dark-border bg-dark-cardElevated text-dark-muted hover:text-dark-text'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload with Client-Side Image Compression */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>2. Photos (Up to 6) — Auto-Compressed to Max 200KB WebP</span>
                </label>
                <span className="text-[11px] text-dark-muted">{compressedImages.length}/6 photos</span>
              </div>

              {/* Upload trigger */}
              <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-dark-border hover:border-brand-emerald/60 rounded-2xl bg-dark-cardElevated/40 cursor-pointer transition-colors group">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageSelection}
                  disabled={isCompressing || compressedImages.length >= 6}
                  className="hidden"
                />
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-2 text-brand-emerald">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-semibold">{compressionProgress}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <UploadCloud className="w-6 h-6 text-brand-emerald group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-dark-text">Click or drag images to compress</span>
                    <span className="text-[10px] text-dark-muted">
                      Compressed client-side to max 200KB with 1200px max width for ultra-fast loading
                    </span>
                  </div>
                )}
              </label>

              {/* Thumbnails Strip with Compression Metrics */}
              {compressedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {compressedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden aspect-square border border-dark-border bg-dark-cardElevated group"
                    >
                      <img src={img.previewUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="self-end p-1 rounded-full bg-rose-500/80 text-white hover:bg-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-[8px] text-brand-emerald font-mono bg-black/70 px-1 py-0.5 rounded text-center">
                          {img.compressedSizeKb} KB ({img.compressionRatio}% saved)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Category Specific Fields */}
            <div className="p-4 rounded-2xl bg-dark-cardElevated/50 border border-dark-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Specific Specifications for {category}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(catAttributes).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-dark-muted mb-1">{key}</label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        setCatAttributes((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                4. Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 15 Pro 128GB Natural Titanium with Bill"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
              />
            </div>

            {/* Price & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                  Expected Price (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-emerald">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 45000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text font-bold focus:outline-none focus:border-brand-emerald"
                  />
                </div>
                {price && Number(price) > 0 && (
                  <p className="text-[11px] text-brand-emerald font-semibold mt-1">
                    {formatIndianCurrency(Number(price))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                  Item Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ConditionType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c} className="bg-dark-card text-dark-text">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Negotiable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 rounded text-brand-emerald accent-brand-emerald"
              />
              <span className="text-xs text-dark-text font-medium">Price is negotiable with genuine buyers</span>
            </label>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const c = e.target.value as CityType;
                    setCity(c);
                    if (MOCK_LOCALITIES[c]?.length) {
                      setLocality(MOCK_LOCALITIES[c][0]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-dark-card text-dark-text">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                  Locality
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                >
                  {(MOCK_LOCALITIES[city] || []).map((loc) => (
                    <option key={loc} value={loc} className="bg-dark-card text-dark-text">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include purchase date, accessories included, cosmetic marks, and reason for selling..."
                className="w-full p-3 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand-emerald"
              />
            </div>

            {/* Indian Regulatory Notice */}
            <div className="p-3 rounded-xl bg-brand-emerald/5 border border-brand-emerald/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <p className="text-[11px] text-dark-muted leading-relaxed">
                By posting, you confirm you are physically located in India and legally own this item under RIO's DPDP-compliant marketplace terms.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-dark-border text-dark-muted hover:text-dark-text text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCompressing || isPublishing}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to RIO...</span>
                  </>
                ) : !quotaStatus.isAllowed ? (
                  <>
                    <Lock className="w-4 h-4 text-brand-amber" />
                    <span>Unlock Ad Slot (₹29)</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Post Listing Live</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
