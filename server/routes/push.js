'use strict';

const router = require('express').Router();
const webpush = require('web-push');
const auth = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');

// Store or update a push subscription for one of the user's devices.
// Keyed by (user, endpoint) so multiple devices coexist — registering a
// desktop no longer overwrites the phone.
router.post('/push-subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, endpoint: subscription.endpoint },
      { user: req.user._id, endpoint: subscription.endpoint, subscription, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('push-subscribe error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove this device's push subscription (by endpoint); if no endpoint is
// provided, remove all of the user's devices.
router.post('/push-unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (endpoint) await PushSubscription.deleteMany({ user: req.user._id, endpoint });
    else await PushSubscription.deleteMany({ user: req.user._id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send an immediate test notification to every device the user has
// registered — lets users verify push works without waiting for a renewal.
router.post('/push/test', auth, async (req, res) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return res.status(503).json({ ok: false, error: 'Push not configured on server' });
    }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:support@renewbell.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    const devices = await PushSubscription.find({ user: req.user._id });
    if (!devices.length) return res.json({ ok: false, sent: 0, error: 'No devices registered for push' });

    const payload = JSON.stringify({
      title: '🔔 RenewBell test notification',
      body: 'Push notifications are working on this device. You\'ll get renewal reminders here.',
      tag: 'renewbell-test',
      url: '/',
    });

    let sent = 0;
    for (const d of devices) {
      try {
        await webpush.sendNotification(d.subscription, payload);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: d._id }); // device gone — clean up
        }
      }
    }
    res.json({ ok: sent > 0, sent, devices: devices.length });
  } catch (err) {
    console.error('push-test error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
