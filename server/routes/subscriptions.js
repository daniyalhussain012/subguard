const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const router = express.Router();
const LIMIT = 5;
router.use(auth);
router.get('/', async (req, res) => {
  try { res.json(await Subscription.find({ user: req.user._id, isActive: true })); }
  catch { res.status(500).json({ error: 'Server error' }); }
});
router.post('/', async (req, res) => {
  try {
    if (req.user.plan === 'free') {
      const count = await Subscription.countDocuments({ user: req.user._id, isActive: true });
      if (count >= LIMIT) return res.status(403).json({ error: 'Free tier limit reached. Upgrade to Premium.' });
    }
    res.status(201).json(await Subscription.create({ ...req.body, user: req.user._id }));
  } catch { res.status(500).json({ error: 'Server error' }); }
});
router.put('/:id', async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!sub) return res.status(404).json({ error: 'Not found' });
    res.json(sub);
  } catch { res.status(500).json({ error: 'Server error' }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false }, { new: true });
    if (!sub) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
router.get('/usage', async (req, res) => {
  try {
    const count = await Subscription.countDocuments({ user: req.user._id, isActive: true });
    res.json({ count, limit: req.user.plan === 'premium' ? null : LIMIT, plan: req.user.plan });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
