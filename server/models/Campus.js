import mongoose from 'mongoose';

const CampusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Presidency University'
  },
  university: {
    type: String,
    required: true,
    default: 'Presidency University Bengaluru'
  },
  tagline: {
    type: String,
    default: 'Your Campus. Your Direction. Your Way.'
  },
  address: {
    type: String,
    default: 'Itgalpur, Rajanakunte, Yelahanka, Bengaluru, Karnataka 560064'
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: Array,
      default: []
    },
    status: {
      type: String,
      default: 'Pending complete perimeter verification by project owner'
    }
  },
  defaultLocation: {
    name: { type: String, default: 'Presidency University – Main Gate' },
    coordinates: {
      lat: { type: Number, required: true, default: 13.1717995 },
      lng: { type: Number, required: true, default: 77.5361915 }
    },
    zoom: { type: Number, default: 18 }
  },
  mapSettings: {
    minZoom: { type: Number, default: 15 },
    maxZoom: { type: Number, default: 22 },
    bounds: {
      southWest: { type: [Number], default: [13.169044795226714, 77.53496327115832] },
      northEast: { type: [Number], default: [13.171866, 77.53670086988951] }
    }
  }
}, { timestamps: true });

export default mongoose.models.Campus || mongoose.model('Campus', CampusSchema);
