import mongoose from 'mongoose';

const IssueReportSchema = new mongoose.Schema({
  reportReference: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Incorrect location',
      'Missing building',
      'Incorrect room information',
      'Blocked walking path',
      'Damaged facility',
      'Construction issue',
      'Incorrect floor plan',
      'Other campus issue'
    ],
    required: true
  },
  description: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Submitted'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  adminNotes: String
}, { timestamps: true });

export default mongoose.models.IssueReport || mongoose.model('IssueReport', IssueReportSchema);
