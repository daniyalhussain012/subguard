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
// Mirror the client's localStorage subscriptions to MongoDB so the daily
// push cron knows what renews when. Replaces the user's server-side copy.
router.post('/sync', async (req, res) => {
  try {
    const items = Array.isArray(req.body.subscriptions) ? req.body.subscriptions : [];
    // Preserve notification-sent flags so a re-sync doesn't cause duplicate pushes
    const existing = await Subscription.find({ user: req.user._id });
    const dateKey = d => { try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; } };
    const notifMap = new Map(existing.map(s => [`${s.name}|${dateKey(s.nextBillingDate)}`, s.notifsSent]));
    await Subscription.deleteMany({ user: req.user._id });
    const docs = items
      .filter(s => s && s.status === 'Active' && s.name && s.nextBillingDate)
      .map(s => ({
        user: req.user._id,
        name: s.name,
        amount: parseFloat(s.amount) || 0,
        currency: s.currency || 'USD',
        billingCycle: s.billingCycle || 'Monthly',
        category: s.category || 'Other',
        nextBillingDate: new Date(s.nextBillingDate),
        isActive: true,
        notifsSent: notifMap.get(`${s.name}|${dateKey(s.nextBillingDate)}`) || undefined,
      }));
    if (docs.length) await Subscription.insertMany(docs);
    res.json({ ok: true, count: docs.length });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const count = await Subscription.countDocuments({ user: req.user._id, isActive: true });
    res.json({ count, limit: req.user.plan === 'premium' ? null : LIMIT, plan: req.user.plan });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
