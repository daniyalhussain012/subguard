'use strict';

// Shared web-push sender. The renewal cron and the feedback-reply flow both
// need to push to a specific user's devices, so the VAPID setup, the
// send-to-every-device loop and the dead-endpoint cleanup live here rather
// than being copy-pasted per caller.

const webpush = require('web-push');
const PushSubscription = require('./models/PushSubscription');

function vapidReady() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@renewbell.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  return true;
}

// Pushes to every device the user has registered. Returns how many landed.
// Never throws: a failed push must not fail the request that triggered it.
async function sendPushToUser(userId, { title, body, url = '/', tag }) {
  try {
    if (!vapidReady()) return 0;
    const devices = await PushSubscription.find({ user: userId });
    const payload = JSON.stringify({ title, body, url, tag });
    let sent = 0;
    for (const d of devices) {
      try {
        await webpush.sendNotification(d.subscription, payload);
        sent++;
      } catch (err) {
        // 410/404 mean the browser dropped the subscription (uninstall, cleared
        // site data). Prune it so it stops being retried forever.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: d._id });
        }
      }
    }
    return sent;
  } catch (err) {
    console.error('[Push] sendPushToUser failed:', err.message);
    return 0;
  }
}

module.exports = { sendPushToUser, vapidReady };
