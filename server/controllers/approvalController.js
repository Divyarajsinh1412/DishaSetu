import { CampusService } from '../services/campusService.js';

export const getApprovals = async (req, res) => {
  try {
    const list = await CampusService.getPendingApprovals();
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected.' });
    }

    await CampusService.reviewApproval(id, decision, req.user, rejectionReason);
    res.json({ success: true, message: `Request ${decision} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await CampusService.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
