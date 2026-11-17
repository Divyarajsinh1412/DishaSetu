import { CampusService } from '../services/campusService.js';

export const getDepartments = async (req, res) => {
  try {
    const { faculty, buildingShortCode } = req.query;
    const departments = await CampusService.getDepartments({ faculty, buildingShortCode });
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      faculty,
      buildingShortCode,
      floorNumber,
      headOfDepartment,
      contactEmail,
      contactPhone,
      description
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and unique code are required.' });
    }

    const dept = await CampusService.createDepartment({
      name,
      code,
      faculty,
      buildingShortCode,
      floorNumber,
      headOfDepartment,
      contactEmail,
      contactPhone,
      description
    }, req.user);

    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CampusService.updateDepartment(id, req.body, req.user);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await CampusService.deleteDepartment(id, req.user);
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
