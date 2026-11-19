import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Coffee,
  X,
  Star,
  Clock,
  MapPin,
  Navigation as NavigationIcon,
  Utensils,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  Flag,
  RotateCcw
} from 'lucide-react';
import { fetchCafes, fetchCafeById, submitReviewApi, reportReviewApi } from '../../services/api';

export default function CafeModal({
  isOpen,
  onClose,
  initialCafeId = null,
  onStartNavigation
}) {
  const [cafes, setCafes] = useState([]);
  const [selectedCafeId, setSelectedCafeId] = useState(initialCafeId || 'PU-CAFE-D-BLOCK');
  const [cafeDetails, setCafeDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'regular', 'reviews'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reportedReviews, setReportedReviews] = useState({});

  // Sync initialCafeId prop when changed
  useEffect(() => {
    if (initialCafeId) {
      setSelectedCafeId(initialCafeId);
    }
  }, [initialCafeId]);

  // Load cafes list
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoading(true);
      const list = await fetchCafes();
      const cafesArr = Array.isArray(list) ? list : (list?.cafes || []);
      setCafes(cafesArr);
      if (cafesArr.length > 0) {
        setSelectedCafeId(prev => {
          if (prev) {
            const found = cafesArr.find(c => c._id === prev || c.shortCode === prev || c.code === prev);
            if (found) return found._id;
          }
          const hatti = cafesArr.find(c => c.shortCode === 'PU-CAFE-D-BLOCK' || /hatti kappi/i.test(c.name));
          return hatti ? hatti._id : cafesArr[0]._id;
        });
      }
      setIsLoading(false);
    };
    load();
  }, [isOpen]);

  // Load selected cafe details
  const loadDetails = useCallback(async () => {
    if (!selectedCafeId) return;
    try {
      const data = await fetchCafeById(selectedCafeId);
      setCafeDetails(data);
    } catch (err) {
      console.warn('[CafeModal] loadDetails error:', err.message);
    }
  }, [selectedCafeId]);

  useEffect(() => {
    loadDetails();
  }, [selectedCafeId, loadDetails]);

  // Real-Time Availability & Menu Updates via Server-Sent Events (SSE)
  useEffect(() => {
    if (!isOpen || !selectedCafeId) return;
    let sse;
    try {
      sse = new EventSource('/api/sync/stream');
      sse.addEventListener('menu:updated', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (!payload.cafeId || payload.cafeId === selectedCafeId || payload.cafeId === cafeDetails?.cafe?._id || payload.cafeId === cafeDetails?.cafe?.shortCode) {
            loadDetails();
          }
        } catch {}
      });
      sse.addEventListener('review:added', () => {
        loadDetails();
      });
    } catch (err) {
      console.warn('[SSE] EventSource connection fallback:', err.message);
    }
    return () => {
      if (sse) sse.close();
    };
  }, [isOpen, selectedCafeId, cafeDetails?.cafe, loadDetails]);

  const currentCafe = cafeDetails?.cafe || cafes.find(c => c._id === selectedCafeId || c.shortCode === selectedCafeId) || cafes[0];

  // Dynamic Rating calculation from backend
  const ratingStats = useMemo(() => {
    if (cafeDetails?.ratingStats) return cafeDetails.ratingStats;
    if (currentCafe?.rating) return currentCafe.rating;
    return { average: 0, count: 0, isNew: true, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }, [cafeDetails, currentCafe]);

  const isNew = ratingStats.isNew || !ratingStats.count || ratingStats.average === 0;

  // Regular menu categories
  const categories = useMemo(() => {
    const items = cafeDetails?.regularMenu || [];
    const set = new Set();
    items.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return ['all', ...Array.from(set)];
  }, [cafeDetails]);

  // Filtered regular menu items
  const filteredRegularMenu = useMemo(() => {
    const items = cafeDetails?.regularMenu || [];
    if (selectedCategory === 'all') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [cafeDetails, selectedCategory]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await submitReviewApi({
        cafeId: currentCafe?._id || selectedCafeId,
        rating,
        comment: comment.trim(),
        reviewerName: reviewerName.trim() || 'Presidency Student / Visitor'
      });

      if (res.error) {
        setReviewError(res.error);
      } else {
        setReviewSuccess(true);
        setComment('');
        await loadDetails();
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    try {
      await reportReviewApi(reviewId, 'Inappropriate or abusive content');
      setReportedReviews(prev => ({ ...prev, [reviewId]: true }));
    } catch (err) {
      console.error('Report review error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Presidency Campus Cafes & Menus</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official dining outlets, regular menus, daily chef specials & verified reviews
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cafe Selector Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {cafes.map(cafe => {
            const isSelected = cafe._id === selectedCafeId;
            return (
              <button
                key={cafe._id}
                onClick={() => setSelectedCafeId(cafe._id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{cafe.name}</span>
              </button>
            );
          })}
        </div>

        {/* Cafe Details Card & Controls */}
        {currentCafe && (
          <div className="p-4 sm:px-6 py-3 bg-[#0B132B]/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{currentCafe.name}</span>
                {isNew ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    New
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(ratingStats.average).toFixed(1)} ★</span>
                    <span className="text-slate-400 font-normal">({ratingStats.count} {ratingStats.count === 1 ? 'review' : 'reviews'})</span>
                  </span>
                )}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>
                    {typeof currentCafe.operatingHours === 'object'
                      ? `${currentCafe.operatingHours.open || '07:30 AM'} – ${currentCafe.operatingHours.close || '08:00 PM'}`
                      : currentCafe.operatingHours || '07:30 AM – 08:00 PM'}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>
                    {currentCafe.shortCode === 'PU-CAFE-D-BLOCK'
                      ? 'Adjacent to D Block pathway · Mechanical Quad'
                      : currentCafe.description || 'Central Campus'}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onStartNavigation) {
                  onStartNavigation({
                    name: currentCafe.name,
                    coordinates: currentCafe.coordinates,
                    category: 'Cafe',
                    description: currentCafe.description
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0"
            >
              <NavigationIcon className="w-4 h-4" />
              <span>Navigate to Cafe</span>
            </button>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs font-semibold px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'today'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Specials (Daily Menu)</span>
          </button>
          <button
            onClick={() => setActiveTab('regular')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'regular'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Regular Menu ({cafeDetails?.regularMenu?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ratings & Reviews ({cafeDetails?.reviews?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          
          {/* 1. TODAY'S DAILY MENU TAB */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {cafeDetails?.todayMenu?.specialHighlights?.length > 0 && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/30 rounded-2xl">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Today's Chef Specials & Highlights</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-200 font-medium">
                    {cafeDetails.todayMenu.specialHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cafeDetails?.todayMenu?.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cafeDetails.todayMenu.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 bg-slate-900/60 rounded-2xl border transition-all ${
                        item.isAvailable !== false
                          ? 'border-slate-800 hover:border-slate-700'
                          : 'border-slate-800/50 opacity-60 bg-slate-950/40'
                      } flex items-center justify-between`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.isVegetarian ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-bold ${item.isAvailable !== false ? 'text-white' : 'text-slate-400 line-through'}`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          {item.session && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                              {item.session}
                            </span>
                          )}
                          {item.isAvailable !== false ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Available
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 text-[11px] font-semibold">
                              <AlertCircle className="w-3 h-3" /> Currently Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-400 font-mono">₹{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Utensils className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div>No special daily menu scheduled for today yet. Regular items available below.</div>
                </div>
              )}
            </div>
          )}

          {/* 2. REGULAR MENU TAB */}
          {activeTab === 'regular' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              {categories.length > 2 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'all' ? 'All Items' : cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredRegularMenu?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRegularMenu.map(item => (
                    <div
                      key={item._id}
                      className={`p-3.5 bg-slate-900/60 rounded-2xl border transition-all ${
                        item.isAvailable !== false
                          ? 'border-slate-800 hover:border-slate-700'
                          : 'border-slate-800/50 opacity-60 bg-slate-950/40'
                      } flex items-center justify-between`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.isVegetarian ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-bold ${item.isAvailable !== false ? 'text-white' : 'text-slate-400 line-through'}`}>
                            {item.name}
                          </span>
                          {item.isChefSpecial && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-slate-500">{item.category}</span>
                          <span>•</span>
                          {item.isAvailable !== false ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Available
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 text-[11px] font-medium">
                              <AlertCircle className="w-3 h-3" /> Currently Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-emerald-400 font-mono">₹{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <div>No regular items cataloged for this category.</div>
                </div>
              )}
            </div>
          )}

          {/* 3. REVIEWS & RATINGS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Distribution Overview */}
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left shrink-0">
                  {isNew ? (
                    <div>
                      <div className="text-3xl font-extrabold text-amber-400 font-mono">New</div>
                      <div className="text-xs text-slate-400 mt-1">No reviews yet</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-extrabold text-amber-400 font-mono flex items-center justify-center sm:justify-start gap-1">
                        <span>{Number(ratingStats.average).toFixed(1)}</span>
                        <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Based on {ratingStats.count} verified {ratingStats.count === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-5 Star Progress Distribution */}
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = ratingStats.distribution ? (ratingStats.distribution[stars] || 0) : 0;
                    const pct = ratingStats.count > 0 ? Math.round((count / ratingStats.count) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-slate-400 font-mono flex items-center justify-end gap-0.5">
                          <span>{stars}</span>
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-[10px] text-slate-500 font-mono text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rate & Review this Cafe</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 font-mono ml-2">
                    {rating} Star{rating > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Your Name / Department (optional)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review or food feedback..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {reviewError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  {reviewSuccess && (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review submitted successfully! Thank you for rating.</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !comment.trim()}
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reviewSubmitting ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Reviews List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verified Student & Faculty Reviews ({cafeDetails?.reviews?.length || 0})
                </div>

                {cafeDetails?.reviews?.map(rev => (
                  <div key={rev._id} className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">{rev.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        {/* Report Review Button */}
                        <button
                          type="button"
                          onClick={() => handleReportReview(rev._id)}
                          disabled={reportedReviews[rev._id]}
                          className={`text-[10px] flex items-center gap-1 transition-colors ${
                            reportedReviews[rev._id]
                              ? 'text-rose-400 cursor-default'
                              : 'text-slate-500 hover:text-rose-400'
                          }`}
                          title="Report inappropriate review"
                        >
                          <Flag className="w-3 h-3" />
                          <span>{reportedReviews[rev._id] ? 'Reported' : 'Report'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      {rev.comment}
                    </p>

                    {/* Official Manager Response */}
                    {rev.reply && (
                      <div className="mt-2 ml-8 p-2.5 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Response from {rev.reply.repliedBy || 'Cafe Manager'}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{rev.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
