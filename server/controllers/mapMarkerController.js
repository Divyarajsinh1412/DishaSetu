import CampusMapMarker from '../models/CampusMapMarker.js';
import syncService from '../services/syncService.js';

/**
 * Controller for Official Presidency University Campus Master Map Markers
 * Enforces Rule 1: Only Admins can create or modify markers. Cafe owners cannot.
 */

export const getMapMarkers = async (req, res) => {
  try {
    const { category, visible } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (visible !== undefined) {
      filter.visible = visible === 'true';
    } else {
      filter.visible = true; // Default to visible markers for public
    }

    const markers = await CampusMapMarker.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json({
      success: true,
      count: markers.length,
      markers
    });
  } catch (error) {
    console.error('[MapMarkerController] getMapMarkers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus map markers',
      error: error.message
    });
  }
};

export const getMapMarkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const marker = await CampusMapMarker.findOne({
      $or: [{ _id: id }, { markerId: id }]
    }).lean();

    if (!marker) {
      return res.status(404).json({
        success: false,
        message: 'Map marker not found'
      });
    }

    return res.status(200).json({
      success: true,
      marker
    });
  } catch (error) {
    console.error('[MapMarkerController] getMapMarkerById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve marker details',
      error: error.message
    });
  }
};

export const createMapMarker = async (req, res) => {
  try {
    // RBAC check: only super_admin or campus_admin
    if (!req.user || !['super_admin', 'campus_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized University Administrators can add campus map markers (Rule 1).'
      });
    }

    const {
      name,
      label,
      category,
      imageX,
      imageY,
      latitude,
      longitude,
      buildingId,
      floorId,
      shortCode,
      description,
      visible,
      verified
    } = req.body;

    if (!name || imageX === undefined || imageY === undefined || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, normalized image coordinates (imageX, imageY), and GPS coordinates (latitude, longitude) are required.'
      });
    }

    const markerId = req.body.markerId || `marker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newMarker = new CampusMapMarker({
      markerId,
      name,
      label: label || name,
      category: category || 'Academic',
      imageX: Number(imageX),
      imageY: Number(imageY),
      latitude: Number(latitude),
      longitude: Number(longitude),
      buildingId: buildingId || null,
      floorId: floorId || null,
      shortCode: shortCode || null,
      description: description || '',
      visible: visible !== undefined ? visible : true,
      verified: verified !== undefined ? verified : true,
      createdBy: req.user.email || 'admin'
    });

    await newMarker.save();

    // Broadcast real-time sync event
    syncService.broadcast('map_marker_created', { marker: newMarker });

    return res.status(201).json({
      success: true,
      message: 'Campus map marker created successfully',
      marker: newMarker
    });
  } catch (error) {
    console.error('[MapMarkerController] createMapMarker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create map marker',
      error: error.message
    });
  }
};

export const updateMapMarker = async (req, res) => {
  try {
    // RBAC check
    if (!req.user || !['super_admin', 'campus_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized University Administrators can update campus map markers (Rule 1).'
      });
    }

    const { id } = req.params;
    const updates = { ...req.body, updatedBy: req.user.email || 'admin' };

    const updatedMarker = await CampusMapMarker.findOneAndUpdate(
      { $or: [{ _id: id }, { markerId: id }] },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedMarker) {
      return res.status(404).json({
        success: false,
        message: 'Map marker not found'
      });
    }

    // Broadcast real-time sync event
    syncService.broadcast('map_marker_updated', { marker: updatedMarker });

    return res.status(200).json({
      success: true,
      message: 'Campus map marker updated successfully',
      marker: updatedMarker
    });
  } catch (error) {
    console.error('[MapMarkerController] updateMapMarker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update map marker',
      error: error.message
    });
  }
};

export const deleteMapMarker = async (req, res) => {
  try {
    // RBAC check
    if (!req.user || !['super_admin', 'campus_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized University Administrators can delete campus map markers (Rule 1).'
      });
    }

    const { id } = req.params;
    const deletedMarker = await CampusMapMarker.findOneAndDelete({
      $or: [{ _id: id }, { markerId: id }]
    });

    if (!deletedMarker) {
      return res.status(404).json({
        success: false,
        message: 'Map marker not found'
      });
    }

    // Broadcast real-time sync event
    syncService.broadcast('map_marker_deleted', { markerId: deletedMarker.markerId });

    return res.status(200).json({
      success: true,
      message: 'Campus map marker deleted successfully',
      markerId: deletedMarker.markerId
    });
  } catch (error) {
    console.error('[MapMarkerController] deleteMapMarker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete map marker',
      error: error.message
    });
  }
};
