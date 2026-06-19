'use strict';

const router = require('express').Router();
const auth = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');

// Store or update push subscription for the authenticated user
router.post('/push-subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, subscription, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('push-subscribe error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove push subscription
router.post('/push-unsubscribe', auth, async (req, res) => {
  try {
    await PushSubscription.deleteOne({ user: req.user._id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
