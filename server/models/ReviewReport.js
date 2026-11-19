import mongoose from 'mongoose';

const ReviewReportSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
    index: true
  },
  reportedBy: {
    type: String,
    required: true,
    trim: true
  },
  reportedByEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  reason: {
    type: String,
    enum: ['inappropriate_content', 'spam', 'harassment', 'misinformation', 'other'],
    required: true
  },
  details: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved_dismissed', 'resolved_review_removed'],
    default: 'pending',
    index: true
  },
  moderatedBy: {
    type: String,
    default: null
  },
  resolutionNotes: {
    type: String,
    default: null
  }
}, { timestamps: true });

ReviewReportSchema.index({ review: 1, status: 1 });

export default mongoose.models.ReviewReport || mongoose.model('ReviewReport', ReviewReportSchema, 'reviewReports');
