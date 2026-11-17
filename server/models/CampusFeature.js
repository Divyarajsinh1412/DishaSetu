import mongoose from 'mongoose';

const CampusFeatureSchema = new mongoose.Schema({
  featureId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['corridor', 'garden', 'divider', 'parking', 'gate_span', 'walkway', 'landmark', 'boundary', 'other'],
    required: true
  },
  geometryType: {
    type: String,
    enum: ['Polygon', 'LineString', 'Point', 'MultiLineString'],
    required: true
  },
  // Coordinates as [ [lat, lng], ... ] for Leaflet and human readability
  coordinates: {
    type: Array,
    required: true
  },
  // Standard GeoJSON representation for spatial indexing [ [lng, lat], ... ]
  geoJSON: {
    type: {
      type: String,
      enum: ['Polygon', 'LineString', 'MultiLineString', 'Point']
    },
    coordinates: {
      type: Array
    }
  },
  style: {
    color: { type: String, default: '#2563eb' },
    fillColor: { type: String, default: '#3b82f6' },
    weight: { type: Number, default: 3 },
    opacity: { type: Number, default: 0.9 },
    fillOpacity: { type: Number, default: 0.25 },
    dashArray: { type: String, default: null }
  },
  metadata: {
    description: String,
    spanPoints: Array,
    order: Number,
    notes: String
  },
  verified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'pending_verification'],
    default: 'published'
  }
}, { timestamps: true });

export default mongoose.models.CampusFeature || mongoose.model('CampusFeature', CampusFeatureSchema);
