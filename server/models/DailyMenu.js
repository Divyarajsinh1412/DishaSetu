import mongoose from 'mongoose';

const DailyMenuItemSubSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true // Cafe owners can toggle in real-time
  },
  photoUrl: {
    type: String,
    default: null
  },
  session: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner', 'All Day'],
    default: 'Lunch'
  }
}, { _id: true });

const DailyMenuSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true,
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD for reliable date-wise matching
    required: true
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CafeOwner',
    default: null
  },
  specialHighlights: [{
    type: String,
    trim: true
  }],
  items: [DailyMenuItemSubSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Compound unique index for date-wise cafe menus
DailyMenuSchema.index({ cafe: 1, date: 1 }, { unique: true });
DailyMenuSchema.index({ date: 1 });

export default mongoose.models.DailyMenu || mongoose.model('DailyMenu', DailyMenuSchema, 'dailyMenus');
