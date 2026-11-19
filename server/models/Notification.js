import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ['all', 'admin', 'cafe_owner', 'user'],
    default: 'all'
  },
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['issue_update', 'menu_update', 'campus_alert', 'survey_update', 'general'],
    default: 'general'
  },
  referenceId: String,
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema, 'notifications');
