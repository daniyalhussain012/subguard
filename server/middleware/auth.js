const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    // Admin accounts get full premium access without payment
    const admins = (process.env.ADMIN_EMAILS || 'daniyalhussain829@gmail.com,daniyalhussain987@hotmail.com')
      .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    if (user.email && admins.includes(user.email.toLowerCase())) {
      user.plan = 'premium';
    }
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};
