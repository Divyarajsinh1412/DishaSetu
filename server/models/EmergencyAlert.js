import mongoose from 'mongoose';

const EmergencyAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  emergencyType: {
    type: String,
    enum: ['Medical', 'Security', 'Fire', 'Accident', 'General SOS'],
    default: 'General SOS'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  nearestLandmark: String,
  message: String,
  senderPhone: String,
  status: {
    type: String,
    enum: ['active', 'responded', 'resolved', 'false_alarm'],
    default: 'active'
  },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  resolvedAt: Date
}, { timestamps: true });

export default mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', EmergencyAlertSchema);
