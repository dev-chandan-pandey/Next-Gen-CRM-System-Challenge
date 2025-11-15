// src/routes/integrations/hubspot.js
const express = require('express');
const { exchangeCodeForTokens, saveTokensToDb } = require('../../services/hubspot');
const prisma = require('../../prismaClient');

const router = express.Router();

// Step 1: redirect user to HubSpot OAuth URL (frontend will call this to start auth)
router.get('/connect', (req, res) => {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const scopes = process.env.HUBSPOT_SCOPES || 'contacts';
  if (!clientId || !redirectUri) return res.status(400).send('HubSpot not configured');
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  res.redirect(url);
});

// Step 2: HubSpot will redirect to your redirect URI with ?code=<code>
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokensToDb(tokens);
    // Redirect to frontend success page
    res.send('HubSpot connected successfully. You can close this window.');
  } catch (err) {
    console.error('HubSpot callback error', err);
    res.status(500).send('Failed to connect to HubSpot');
  }
});

// Webhook receiver (HubSpot can be configured to post to this URL)
// You may need to configure verification / signing depending on HubSpot settings.
router.post('/webhook', express.json(), async (req, res) => {
  // For basic demo: log events and optionally process contact updates
  console.log('HubSpot webhook payload', JSON.stringify(req.body).slice(0, 1000));
  // Example: if contact updated, sync status back to lead by email
  try {
    if (Array.isArray(req.body)) {
      for (const ev of req.body) {
        // implement event parsing based on your webhook subscription
      }
    }
  } catch (err) {
    console.error('HubSpot webhook processing error', err);
  }
  res.status(200).send('ok');
});

module.exports = router;
