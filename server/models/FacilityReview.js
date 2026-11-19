import mongoose from 'mongoose';

const FacilityReviewSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewerName: {
    type: String,
    default: 'Presidency Student / Visitor'
  },
  comment: {
    type: String,
    trim: true,
    required: true
  },
  photos: [String],
  helpfulVotes: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportedReason: String,
  reply: {
    text: String,
    repliedAt: Date,
    repliedBy: String
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.FacilityReview || mongoose.model('FacilityReview', FacilityReviewSchema);
