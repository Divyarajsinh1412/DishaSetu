import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  userRole: { type: String, default: 'admin' },
  resource: { type: String, required: true },
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema, 'auditLogs');
