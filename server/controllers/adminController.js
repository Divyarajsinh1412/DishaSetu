import { signToken, verifyToken, verifyPassword, hashPassword } from '../utils/auth.js';
import AdminUser from '../models/AdminUser.js';
import { getDbStatus } from '../config/db.js';

// Pre-seeded fallback admin credentials
const FALLBACK_ADMIN = {
  id: 'admin_master_1',
  name: 'Presidency Super Admin',
  email: 'admin@presidency.ac.in',
  role: 'super_admin',
  passwordHash: hashPassword('Admin@Presidency2026')
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    let user = null;
    const db = getDbStatus();

    if (db.connected) {
      user = await AdminUser.findOne({ email: email.toLowerCase() });
    }

    // Fallback authentication if DB connecting or in dev
    if (!user && email.toLowerCase() === FALLBACK_ADMIN.email) {
      if (verifyPassword(password, FALLBACK_ADMIN.passwordHash)) {
        user = FALLBACK_ADMIN;
      }
    } else if (user) {
      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) user = null;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials' });
    }

    const token = signToken({
      userId: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};
