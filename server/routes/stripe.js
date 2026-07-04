const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

const getStripe = () => require('stripe')(process.env.STRIPE_SECRET_KEY);

function fiveYearsFromNow() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 5);
  return d;
}

const createSession = async (email, userId, frontendUrl) => {
  return getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'RenewBell Pro — 5-Year Access',
          description: 'Unlimited subscriptions, all features, 5 years of access. One-time payment.',
        },
        unit_amount: 500,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${frontendUrl}/upgrade?upgraded=true`,
    cancel_url: `${frontendUrl}/upgrade?cancelled=true`,
    customer_email: email,
    metadata: { userId: userId.toString() },
  });
};

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const session = await createSession(req.user.email, req.user._id, process.env.FRONTEND_URL);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/payment-link', auth, async (req, res) => {
  try {
    const session = await createSession(req.user.email, req.user._id, process.env.FRONTEND_URL);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Payment link error:', err);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

router.post('/verify-session', auth, async (req, res) => {
  try {
    const session = await getStripe().checkout.sessions.retrieve(req.body.sessionId);
    if (session.payment_status === 'paid') {
      const user = await User.findByIdAndUpdate(
        session.metadata.userId,
        {
          plan: 'premium',
          stripeSessionId: session.id,
          premiumActivatedAt: new Date(),
          premiumExpiresAt: fiveYearsFromNow(),
        },
        { new: true }
      );
      return res.json({ plan: user.plan, premiumExpiresAt: user.premiumExpiresAt });
    }
    res.json({ plan: req.user.plan });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verify failed' });
  }
});

module.exports = router;
