import PanoramaScene from '../models/PanoramaScene.js';
import PanoramaHotspot from '../models/PanoramaHotspot.js';
import { INITIAL_PANORAMA_SCENES, INITIAL_PANORAMA_HOTSPOTS } from '../data/panoramaDataset.js';
import { getDbStatus } from '../config/db.js';
import syncService from '../services/syncService.js';

// In-memory fallback stores
let memoryScenes = [...INITIAL_PANORAMA_SCENES];
let memoryHotspots = [...INITIAL_PANORAMA_HOTSPOTS];

export const getPanoramaScenes = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const scenes = await PanoramaScene.find({ status: 'published' }).sort({ order: 1 });
      if (scenes && scenes.length > 0) {
        return res.json({ success: true, count: scenes.length, data: scenes });
      }
    }
    res.json({ success: true, count: memoryScenes.length, data: memoryScenes });
  } catch (err) {
    res.json({ success: true, count: memoryScenes.length, data: memoryScenes });
  }
};

export const getPanoramaSceneById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const scene = await PanoramaScene.findOne({ sceneId: id });
      if (scene) return res.json({ success: true, data: scene });
    }
    const mem = memoryScenes.find(s => s.sceneId === id);
    if (!mem) return res.status(404).json({ success: false, message: 'Panorama scene not found' });
    res.json({ success: true, data: mem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPanoramaScene = async (req, res) => {
  try {
    const sceneData = req.body;
    const dbStatus = getDbStatus();
    let created = null;

    if (dbStatus.connected) {
      created = await PanoramaScene.create(sceneData);
    } else {
      created = { ...sceneData, createdAt: new Date() };
      memoryScenes.push(created);
    }

    syncService.broadcast('panorama:scene_created', created);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePanoramaScene = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const dbStatus = getDbStatus();
    let updated = null;

    if (dbStatus.connected) {
      updated = await PanoramaScene.findOneAndUpdate({ sceneId: id }, { $set: updates }, { new: true });
    }

    const idx = memoryScenes.findIndex(s => s.sceneId === id);
    if (idx !== -1) {
      memoryScenes[idx] = { ...memoryScenes[idx], ...updates };
      if (!updated) updated = memoryScenes[idx];
    }

    syncService.broadcast('panorama:scene_updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePanoramaScene = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await PanoramaScene.findOneAndDelete({ sceneId: id });
    }

    const idx = memoryScenes.findIndex(s => s.sceneId === id);
    if (idx !== -1) memoryScenes.splice(idx, 1);

    syncService.broadcast('panorama:scene_deleted', { sceneId: id });
    res.json({ success: true, message: `Scene ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPanoramaHotspots = async (req, res) => {
  try {
    const { sceneId } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const query = { active: true };
      if (sceneId) query.sceneId = sceneId;
      const hotspots = await PanoramaHotspot.find(query);
      if (hotspots && hotspots.length > 0) {
        return res.json({ success: true, count: hotspots.length, data: hotspots });
      }
    }

    let list = [...memoryHotspots];
    if (sceneId) list = list.filter(h => h.sceneId === sceneId);
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.json({ success: true, count: memoryHotspots.length, data: memoryHotspots });
  }
};

export const createPanoramaHotspot = async (req, res) => {
  try {
    const hotspotData = req.body;
    const dbStatus = getDbStatus();
    let created = null;

    if (dbStatus.connected) {
      created = await PanoramaHotspot.create(hotspotData);
    } else {
      created = { ...hotspotData, createdAt: new Date() };
      memoryHotspots.push(created);
    }

    syncService.broadcast('panorama:hotspot_created', created);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePanoramaHotspot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const dbStatus = getDbStatus();
    let updated = null;

    if (dbStatus.connected) {
      updated = await PanoramaHotspot.findOneAndUpdate(
        { $or: [{ hotspotId: id }, { _id: id }] },
        { $set: updates },
        { new: true }
      );
    }

    const idx = memoryHotspots.findIndex(h => h.hotspotId === id || h._id === id);
    if (idx !== -1) {
      memoryHotspots[idx] = { ...memoryHotspots[idx], ...updates };
      if (!updated) updated = memoryHotspots[idx];
    }

    syncService.broadcast('panorama:hotspot_updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePanoramaHotspot = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await PanoramaHotspot.findOneAndDelete({ $or: [{ hotspotId: id }, { _id: id }] });
    }

    const idx = memoryHotspots.findIndex(h => h.hotspotId === id || h._id === id);
    if (idx !== -1) memoryHotspots.splice(idx, 1);

    syncService.broadcast('panorama:hotspot_deleted', { hotspotId: id });
    res.json({ success: true, message: `Hotspot ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
