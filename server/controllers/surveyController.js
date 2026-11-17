import Location from '../models/Location.js';
import Building from '../models/Building.js';
import SurveyRecord from '../models/SurveyRecord.js';
import { COMPLETE_CAMPUS_CATALOG } from '../data/campusCatalog.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';

// In-memory fallback stores for survey checklist
let memoryCatalog = [...COMPLETE_CAMPUS_CATALOG];
let memorySurveyRecords = [];

/**
 * Get comprehensive survey checklist with progress analytics
 */
export const getSurveyChecklist = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let items = [...memoryCatalog];

    if (category && category !== 'all') {
      items = items.filter(i => i.category === category);
    }
    if (status && status !== 'all') {
      items = items.filter(i => (i.verificationStatus || '').toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.shortCode && i.shortCode.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

    // Calculate real-time statistics
    const total = memoryCatalog.length;
    const published = memoryCatalog.filter(i => i.verificationStatus === 'Published').length;
    const verified = memoryCatalog.filter(i => i.verificationStatus === 'Verified').length;
    const gpsCaptured = memoryCatalog.filter(i => i.verificationStatus === 'GPS Captured').length;
    const pending = memoryCatalog.filter(i => !i.coordinates || i.verificationStatus === 'Awaiting Survey' || i.verificationStatus === 'Not Surveyed').length;
    const percentComplete = Math.round(((published + verified + gpsCaptured) / total) * 100);

    res.json({
      success: true,
      stats: {
        total,
        published,
        verified,
        gpsCaptured,
        pending,
        percentComplete
      },
      data: items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Capture or update GPS coordinates for any campus building / location
 * Handles manual entry, Google Maps coordinate string parsing, and mobile device GPS
 */
export const captureGpsSurvey = async (req, res) => {
  try {
    const {
      locationId,
      lat,
      lng,
      googleMapsString,
      gpsAccuracy,
      surveyorName = 'Field Administrator',
      surveyNotes = '',
      photoUrls = [],
      entrances = [],
      surveyMethod = 'mobile_gps'
    } = req.body;

    let finalLat = lat;
    let finalLng = lng;

    // Parse Google Maps string if provided: "13.1718, 77.5362" or "13.1717995,77.5361915"
    if (googleMapsString && typeof googleMapsString === 'string') {
      const match = googleMapsString.trim().match(/([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)/);
      if (match) {
        finalLat = parseFloat(match[1]);
        finalLng = parseFloat(match[2]);
      }
    }

    if (finalLat === undefined || finalLng === undefined || isNaN(finalLat) || isNaN(finalLng)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude coordinates are required.' });
    }

    // Update in memory catalog
    const idx = memoryCatalog.findIndex(i => i.locationId === locationId);
    let targetRecord = null;

    if (idx !== -1) {
      memoryCatalog[idx] = {
        ...memoryCatalog[idx],
        coordinates: { lat: finalLat, lng: finalLng },
        entranceCoordinates: { lat: finalLat, lng: finalLng },
        entrances: entrances.length > 0 ? entrances : (memoryCatalog[idx].entrances || []),
        coordinateSource: surveyMethod === 'mobile_gps' ? 'Mobile High-Precision GPS' : 'Manual Ground Survey',
        gpsAccuracy: gpsAccuracy || 1.5,
        surveyDate: new Date().toISOString().split('T')[0],
        surveyedBy: surveyorName,
        surveyNotes,
        verificationStatus: 'GPS Captured',
        approvalStatus: 'Pending Verification'
      };
      targetRecord = memoryCatalog[idx];
    }

    // Persist to MongoDB Atlas if connected
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      await Location.findOneAndUpdate(
        { $or: [{ locationId }, { name: targetRecord?.name }] },
        {
          $set: {
            coordinates: { lat: finalLat, lng: finalLng },
            entranceCoordinates: { lat: finalLat, lng: finalLng },
            entrances: entrances.length > 0 ? entrances : undefined,
            coordinateSource: 'Ground Survey',
            gpsAccuracy: gpsAccuracy || 1.5,
            surveyDate: new Date(),
            surveyedBy: surveyorName,
            surveyNotes,
            verificationStatus: 'GPS Captured',
            approvalStatus: 'Pending Verification'
          }
        }
      );
    }

    // Create Audit Survey Record
    const record = {
      recordId: `surv_${Date.now()}`,
      targetType: targetRecord?.category === 'Academic' ? 'building' : 'location',
      targetId: locationId,
      targetName: targetRecord?.name || locationId,
      surveyMethod,
      capturedCoordinates: { lat: finalLat, lng: finalLng },
      gpsAccuracyMeters: gpsAccuracy,
      surveyorName,
      surveyDate: new Date(),
      notes: surveyNotes,
      photoUrls,
      surveyStatus: 'gps_captured',
      verificationStatus: 'unverified'
    };
    memorySurveyRecords.push(record);

    syncService.broadcast('survey:coordinate_captured', targetRecord);
    res.status(200).json({
      success: true,
      message: `Successfully captured GPS coordinates for ${targetRecord?.name || locationId}.`,
      data: targetRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Verify surveyed campus record
 */
export const verifySurveyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { verifiedBy = 'Super Admin' } = req.body;

    const idx = memoryCatalog.findIndex(i => i.locationId === id);
    if (idx !== -1) {
      memoryCatalog[idx].verificationStatus = 'Verified';
      memoryCatalog[idx].approvalStatus = 'Approved';
      memoryCatalog[idx].verifiedBy = verifiedBy;
      memoryCatalog[idx].verificationDate = new Date().toISOString();
    }

    syncService.broadcast('survey:record_verified', memoryCatalog[idx]);
    res.json({ success: true, message: `Record ${id} verified.`, data: memoryCatalog[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Publish verified record to official public map and routing graph
 */
export const publishSurveyRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const idx = memoryCatalog.findIndex(i => i.locationId === id);
    if (idx !== -1) {
      memoryCatalog[idx].verificationStatus = 'Published';
      memoryCatalog[idx].approvalStatus = 'Published';
    }

    syncService.broadcast('survey:record_published', memoryCatalog[idx]);
    res.json({ success: true, message: `Record ${id} published to live campus map.`, data: memoryCatalog[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Bulk export of survey checklist as CSV or JSON
 */
export const exportSurveyChecklist = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="Presidency_Campus_Survey_Checklist.json"');
      return res.send(JSON.stringify(memoryCatalog, null, 2));
    }

    // Generate CSV
    const headers = [
      'Location ID',
      'Name',
      'Short Code',
      'Category',
      'Latitude',
      'Longitude',
      'Verification Status',
      'Coordinate Source',
      'GPS Accuracy (m)',
      'Surveyed By',
      'Survey Date',
      'Notes'
    ];

    const rows = memoryCatalog.map(item => [
      `"${item.locationId || ''}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.shortCode || ''}"`,
      `"${item.category || ''}"`,
      item.coordinates?.lat || '',
      item.coordinates?.lng || '',
      `"${item.verificationStatus || 'Awaiting Survey'}"`,
      `"${item.coordinateSource || 'Not Surveyed'}"`,
      item.gpsAccuracy || '',
      `"${item.surveyedBy || ''}"`,
      `"${item.surveyDate || ''}"`,
      `"${(item.surveyNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Presidency_Campus_Survey_Checklist.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
