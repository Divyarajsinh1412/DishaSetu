import mongoose from 'mongoose';

const FacilityReviewSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewerName: {
    type: String,
    default: 'Campus Visitor'
  },
  comment: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.FacilityReview || mongoose.model('FacilityReview', FacilityReviewSchema);
