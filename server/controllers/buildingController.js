import { CampusService } from '../services/campusService.js';

export const getBuildings = async (req, res) => {
  try {
    const { category, search } = req.query;
    const buildings = await CampusService.getBuildings(category, search);
    res.json({ success: true, count: buildings.length, data: buildings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await CampusService.getBuildingById(id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.json({ success: true, data: building });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBuilding = async (req, res) => {
  try {
    const { name, shortCode, category, description, totalFloors, departments, photos } = req.body;
    if (!name || !shortCode) {
      return res.status(400).json({ success: false, message: 'Building name and short code are required.' });
    }

    const building = await CampusService.createBuilding({
      name,
      shortCode,
      category,
      description,
      totalFloors,
      departments,
      photos
    }, req.user);

    res.status(201).json({ success: true, data: building });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CampusService.updateBuilding(id, req.body, req.user);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    await CampusService.deleteBuilding(id, req.user);
    res.json({ success: true, message: 'Building deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addBuildingEntrance = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates, isAccessible, isPrimary, hasRamp, hasElevatorNearby, notes } = req.body;

    if (!coordinates || coordinates.lat == null || coordinates.lng == null) {
      return res.status(400).json({ success: false, message: 'Valid entrance coordinates (lat, lng) are required.' });
    }

    const updatedBuilding = await CampusService.addBuildingEntrance(id, {
      name,
      coordinates,
      isAccessible,
      isPrimary,
      hasRamp,
      hasElevatorNearby,
      notes
    }, req.user);

    res.status(201).json({ success: true, data: updatedBuilding });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBuildingEntrance = async (req, res) => {
  try {
    const { id, entranceId } = req.params;
    const updatedBuilding = await CampusService.deleteBuildingEntrance(id, entranceId, req.user);
    res.json({ success: true, data: updatedBuilding });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
