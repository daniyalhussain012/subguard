const jwt = require('jsonwebtoken');
const User = require('../models/User');

function emailListFrom(envVar) {
  return (process.env[envVar] || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

// Admin accounts get premium without payment AND can read the admin
// endpoints. Configured ONLY via ADMIN_EMAILS — no emails hardcoded in source.
function isAdminEmail(email) {
  if (!email) return false;
  return emailListFrom('ADMIN_EMAILS').includes(email.toLowerCase());
}

// Demo/review accounts (e.g. the Google Play review login) get premium so
// reviewers can reach every feature — but deliberately NOT admin rights,
// which would expose the signup list at /api/admin/users.
function isDemoEmail(email) {
  if (!email) return false;
  return emailListFrom('DEMO_EMAILS').includes(email.toLowerCase());
}

function applyAdminOverride(user) {
  if (user && (isAdminEmail(user.email) || isDemoEmail(user.email))) user.plan = 'premium';
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
module.exports.isDemoEmail = isDemoEmail;
module.exports.applyAdminOverride = applyAdminOverride;
