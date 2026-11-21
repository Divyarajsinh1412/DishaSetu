import { CampusService } from '../services/campusService.js';

export const getRoutes = async (req, res) => {
  try {
    const routes = await CampusService.getRoutes();
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PHASE 3A: Calculate Dijkstra shortest path on pedestrian network
 * POST /api/navigation/route
 */
export const calculateNavigationRoute = async (req, res) => {
  try {
    const { start, destination, accessibleOnly, startCoords, destCoords, startName, destName } = req.body;

    if (!start && !startCoords) {
      return res.status(400).json({
        success: false,
        message: 'Start origin identifier or coordinates are required.'
      });
    }

    if (!destination && !destCoords) {
      return res.status(400).json({
        success: false,
        message: 'Destination identifier or coordinates are required.'
      });
    }

    const route = CampusService.calculateRoute({
      start,
      destination,
      accessibleOnly: Boolean(accessibleOnly),
      startCoords,
      destCoords,
      startName,
      destName
    });

    res.json({
      success: true,
      message: `Calculated walking route from "${route.startLocation.name}" to "${route.endLocation.name}".`,
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all Navigation Graph Nodes
 * GET /api/navigation/nodes
 */
export const getNavigationNodes = async (req, res) => {
  try {
    const nodes = await CampusService.getNavigationNodes();
    res.json({ success: true, count: nodes.length, data: nodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all Walking Paths (Graph Edges)
 * GET /api/navigation/paths
 */
export const getWalkingPaths = async (req, res) => {
  try {
    const paths = await CampusService.getWalkingPaths();
    res.json({ success: true, count: paths.length, data: paths });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Complete Navigation Graph (Nodes + Paths)
 * GET /api/navigation/graph
 */
export const getNavigationGraph = async (req, res) => {
  try {
    const nodes = await CampusService.getNavigationNodes();
    const paths = await CampusService.getWalkingPaths();
    res.json({
      success: true,
      data: {
        nodes,
        paths,
        totalNodes: nodes.length,
        totalPaths: paths.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a new Walking Path
 * POST /api/admin/paths
 */
export const createWalkingPath = async (req, res) => {
  try {
    const newPath = await CampusService.addWalkingPath(req.body, req.adminUser);
    res.status(201).json({
      success: true,
      message: `Walking path "${newPath.name}" created successfully.`,
      data: newPath
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update a Walking Path (e.g. toggle active/closed)
 * PUT /api/admin/paths/:id
 */
export const updateWalkingPath = async (req, res) => {
  try {
    const updated = await CampusService.updateWalkingPath(req.params.id, req.body, req.adminUser);
    res.json({
      success: true,
      message: `Walking path "${updated.name}" updated successfully.`,
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete a Walking Path
 * DELETE /api/admin/paths/:id
 */
export const deleteWalkingPath = async (req, res) => {
  try {
    await CampusService.deleteWalkingPath(req.params.id, req.adminUser);
    res.json({
      success: true,
      message: `Walking path ${req.params.id} deleted successfully.`
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Import a Walking Path from KML file/text
 * POST /api/admin/paths/import-kml
 */
export const importKmlWalkingPath = async (req, res) => {
  try {
    const importedPath = await CampusService.importKmlPath(
      req.body,
      req.adminUser || { email: 'admin@presidency.ac.in', role: 'super_admin' }
    );
    res.status(201).json({
      success: true,
      message: `Verified KML walking path "${importedPath.name}" imported successfully (${importedPath.pointCount} points, ${importedPath.distanceMeters}m).`,
      data: importedPath
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
