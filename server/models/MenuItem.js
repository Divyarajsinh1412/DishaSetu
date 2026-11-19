import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
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
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner', 'Beverages', 'Desserts', 'Combos'],
    default: 'Breakfast'
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
    default: true
  },
  isChefSpecial: {
    type: Boolean,
    default: false
  },
  photoUrl: {
    type: String
  },
  rating: {
    type: Number,
    default: 4.5
  }
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema, 'menuItems');
