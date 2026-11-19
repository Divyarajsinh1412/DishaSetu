import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetType: {
    type: String,
    enum: ['location', 'building', 'room', 'cafe', 'facility'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  customLabel: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['classrooms', 'cafeteria', 'parking', 'library', 'labs', 'admin', 'personal'],
    default: 'personal'
  },
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

BookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema, 'bookmarks');
