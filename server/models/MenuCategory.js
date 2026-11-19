import mongoose from 'mongoose';

const MenuCategorySchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

MenuCategorySchema.index({ cafe: 1, name: 1 }, { unique: true });

export default mongoose.models.MenuCategory || mongoose.model('MenuCategory', MenuCategorySchema, 'menuCategories');
