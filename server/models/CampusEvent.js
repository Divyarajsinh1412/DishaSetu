import mongoose from 'mongoose';

const CampusEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['Academic', 'Cultural', 'Sports', 'Seminar', 'Workshop', 'Placement', 'Other'],
    default: 'Academic'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  venue: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
  organizer: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, { timestamps: true });

export default mongoose.models.CampusEvent || mongoose.model('CampusEvent', CampusEventSchema);
