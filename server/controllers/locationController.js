import { CampusService } from '../services/campusService.js';

export const getLocations = async (req, res) => {
  try {
    const { category, search } = req.query;
    const locations = await CampusService.getLocations(category, search);
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name, category, coordinates, description, shortCode } = req.body;
    if (!name || !category || !coordinates || coordinates.lat == null || coordinates.lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and valid coordinates (lat, lng) are required.'
      });
    }

    const newLocation = await CampusService.addLocation({
      name,
      category,
      coordinates: { lat: Number(coordinates.lat), lng: Number(coordinates.lng) },
      geometry: {
        type: 'Point',
        coordinates: [Number(coordinates.lng), Number(coordinates.lat)]
      },
      description,
      shortCode,
      verified: false,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    const isDbUnavailable = error.message && error.message.includes('Database write operation unavailable');
    res.status(isDbUnavailable ? 503 : 500).json({ success: false, message: error.message });
  }
};

/**
 * PHASE 3A: Complete Campus Catalog (38 Locations)
 * GET /api/campus/catalog
 */
export const getCampusCatalog = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const catalog = await CampusService.getCampusCatalog({ category, status, search });
    res.json({
      success: true,
      count: catalog.length,
      data: catalog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PHASE 3A: GPS Survey Update for Catalog Location
 * PUT /api/admin/locations/:id/survey
 */
export const updateLocationSurvey = async (req, res) => {
  try {
    const updated = await CampusService.updateLocationSurvey(
      req.params.id,
      req.body,
      req.adminUser
    );
    res.json({
      success: true,
      message: `GPS Survey data for "${updated.name}" updated successfully.`,
      data: updated
    });
  } catch (error) {
    const isDbUnavailable = error.message && error.message.includes('Database write operation unavailable');
    res.status(isDbUnavailable ? 503 : 400).json({ success: false, message: error.message });
  }
};
