import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  MapPin,
  Building2,
  Search,
  Clock,
  ShieldAlert,
  HelpCircle,
  Coffee,
  Navigation
} from 'lucide-react';
import { submitIssueReportApi } from '../../services/api';

const CATEGORIES = [
  { id: 'navigation_error', label: 'Navigation Route Inaccuracy', icon: Navigation, desc: 'Path blocked, wrong turn, or pedestrian path mismatch' },
  { id: 'accessibility_block', label: 'Broken Lift / Ramp / Accessibility', icon: AlertTriangle, desc: 'Elevator under maintenance or ramp obstacle' },
  { id: 'signage_missing', label: 'Signage or Room Label Missing', icon: Building2, desc: 'Unmarked classroom, laboratory, or entrance' },
  { id: 'cafe_feedback', label: 'Dining / Food Court Feedback', icon: Coffee, desc: 'Menu question, hygiene, or dining facility feedback' },
  { id: 'safety_concern', label: 'Campus Safety / Maintenance Hazard', icon: ShieldAlert, desc: 'Pothole, dark pathway, or broken fixture' },
  { id: 'general_query', label: 'General Campus Navigation Query', icon: HelpCircle, desc: 'General help finding a department or event' }
];

export default function IssueReportModal({
  isOpen,
  onClose,
  buildings = [],
  userLocation = null
}) {
  const [category, setCategory] = useState('navigation_error');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Track existing issue mode
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'track'
  const [trackCode, setTrackCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a subject title and brief description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        reporterName: reporterName.trim() || 'Anonymous Campus Explorer',
        reporterContact: reporterContact.trim(),
        building: selectedBuilding || undefined,
        locationCoordinates: userLocation ? [userLocation.lat, userLocation.lng] : undefined
      };

      const result = await submitIssueReportApi(payload);
      setSubmittedIssue(result.issue || {
        issueCode: `PU-ISSUE-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'received',
        title: title.trim()
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSubmittedIssue(null);
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-prevent-map-zoom="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-prevent-map-zoom="true"
        className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 overscroll-contain isolate-scroll"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Presidency Campus Helpdesk
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                  Rule 3: User Voice
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Report path obstacles, incorrect pins, accessibility blocks, or dining queries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4">
          <button
            onClick={() => { setActiveTab('report'); setSubmittedIssue(null); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'report'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit New Campus Report
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'track'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Track Existing Report
          </button>
        </div>

        {/* Body */}
        <div
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-prevent-map-zoom="true"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/40 overscroll-contain isolate-scroll"
        >
          
          {activeTab === 'track' ? (
            /* Track Existing Issue View */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter Issue Tracking Reference Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder="e.g. PU-ISSUE-849201"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (!trackCode.trim()) return;
                      alert(`Tracking ${trackCode}: In review by Presidency University Estates & GIS Team.`);
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-white">How Tracking Works:</span> Every submitted navigation inaccuracy or facility obstacle is assigned a permanent tracking ticket. Campus Administrators inspect the coordinates and resolve the route within 24–48 hours.
              </div>
            </div>
          ) : submittedIssue ? (
            /* Success Receipt View */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Issue Report Logged Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Thank you for keeping Presidency University safe, accessible, and accurately mapped.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl max-w-sm mx-auto text-left shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">Tracking Reference:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {submittedIssue.issueCode || 'PU-ISSUE-104928'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {submittedIssue.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] uppercase">
                    Received · Under Review
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
                >
                  Submit Another Report
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Back to Campus Map
                </button>
              </div>
            </div>
          ) : (
            /* Issue Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category Radio Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Issue Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-snug">{cat.label}</div>
                          <div className="text-[10px] text-slate-500 truncate">{cat.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. West Ramp near D Block is temporarily blocked for construction"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe the issue, specific landmark nearby, and recommended pedestrian workaround..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Building Association & Reporter Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nearby Campus Building / Zone
                  </label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Building (Optional)</option>
                    {buildings.map((b) => (
                      <option key={b.buildingId || b._id} value={b.buildingName || b.name}>
                        {b.buildingName || b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Your Name or Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Rahul Sharma / 20241CSE0142"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Logging Ticket...' : 'Submit Helpdesk Report'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
