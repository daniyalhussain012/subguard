const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin accounts get premium without payment. Configured ONLY via the
// ADMIN_EMAILS env var (comma-separated) — no emails hardcoded in source.
function isAdminEmail(email) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase());
}

function applyAdminOverride(user) {
  if (user && isAdminEmail(user.email)) user.plan = 'premium';
  return user;
}

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = applyAdminOverride(user);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

module.exports.isAdminEmail = isAdminEmail;
module.exports.applyAdminOverride = applyAdminOverride;
