import { CampusService } from '../services/campusService.js';
import { getDbStatus } from '../config/db.js';

export const getCampusOverview = async (req, res) => {
  try {
    const campus = await CampusService.getCampusInfo();
    const features = await CampusService.getFeatures();
    const locations = await CampusService.getLocations();
    const routes = await CampusService.getRoutes();
    const db = getDbStatus();

    res.json({
      success: true,
      campus,
      featuresCount: features.length,
      locationsCount: locations.length,
      routesCount: routes.length,
      dbStatus: db
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllFeatures = async (req, res) => {
  try {
    const { category } = req.query;
    const features = await CampusService.getFeatures(category);
    res.json({ success: true, count: features.length, data: features });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PHASE 4: Automatic Map Expansion
 * Dynamically computes the bounding box encompassing all published campus features and surveyed locations.
 */
export const getDynamicCampusBounds = async (req, res) => {
  try {
    const locations = await CampusService.getLocations();
    const features = await CampusService.getFeatures();

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let pointCount = 0;

    const includePoint = (lat, lng) => {
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        pointCount++;
      }
    };

    // Include all surveyed locations
    locations.forEach(loc => {
      if (loc.coordinates && loc.coordinates.lat && loc.coordinates.lng) {
        includePoint(loc.coordinates.lat, loc.coordinates.lng);
      }
      if (loc.entrances && Array.isArray(loc.entrances)) {
        loc.entrances.forEach(ent => {
          if (ent.coordinates) includePoint(ent.coordinates.lat, ent.coordinates.lng);
        });
      }
    });

    // Include all published features
    features.forEach(feat => {
      if (feat.coordinates && Array.isArray(feat.coordinates)) {
        const flatten = (arr) => {
          if (arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
            includePoint(arr[0], arr[1]);
          } else {
            arr.forEach(item => {
              if (Array.isArray(item)) flatten(item);
            });
          }
        };
        flatten(feat.coordinates);
      }
    });

    // Fallback to official campus boundary coordinates if no points registered
    if (pointCount === 0) {
      minLat = 13.169044;
      maxLat = 13.171866;
      minLng = 77.534963;
      maxLng = 77.536700;
    }

    // Add 5% padding so features along the perimeter are never clipped
    const latBuffer = (maxLat - minLat) * 0.05 || 0.0002;
    const lngBuffer = (maxLng - minLng) * 0.05 || 0.0002;

    const southWest = [minLat - latBuffer, minLng - lngBuffer];
    const northEast = [maxLat + latBuffer, maxLng + lngBuffer];
    const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

    res.json({
      success: true,
      data: {
        bounds: { southWest, northEast },
        center,
        extent: { minLat, maxLat, minLng, maxLng },
        pointCount,
        locationsCount: locations.length,
        featuresCount: features.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
