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
