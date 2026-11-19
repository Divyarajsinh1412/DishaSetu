import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['cafe', 'location', 'building', 'facility'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetName: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'faculty', 'staff', 'visitor', 'admin'],
    default: 'student'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  cleanlinessRating: {
    type: Number,
    min: 1,
    max: 5
  },
  accessibilityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  tags: [String],
  isApproved: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending_moderation', 'flagged', 'hidden'],
    default: 'approved'
  }
}, { timestamps: true });

ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema, 'reviews');
