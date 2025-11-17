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
// inside router.post('/webhook', express.json(), async (req, res) => { ... })
router.post('/webhook', express.json(), async (req, res) => {
  try {
    // HubSpot webhook payload structure varies; common pattern:
    // { subscriptionId, propertyName, eventId, objectId, changeSource, properties, ... }
    // For demo, handle contact propertyChange events: find lead by email and update status/lifecycle
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of events) {
      // For contacts v3, body shapes differ. We attempt to extract email or lifecycle stage.
      // Example hubspot change: ev.objectId or ev.matchingProperties.email ...
      // Best practice: inspect actual payload from HubSpot and adapt accordingly.
      // Below: attempt to fetch contact by objectId via HubSpot API if integration exists.

      if (ev.propertyName && ev.propertyName === 'lifecyclestage') {
        // lifecycle changed
        // find contact details (we may need to call HubSpot API)
        const contactId = ev.objectId;
        // load integration tokens
        const integration = await prisma.hubSpotIntegration.findFirst();
        if (!integration) continue;
        let token = integration.accessToken;
        // refresh if needed (reuse hubspot service logic)...
        // For brevity: attempt to fetch contact and update lead with matching email
        const { refreshTokens } = require('../../services/hubspot');
        // fetch contact
        const axios = require('axios');
        try {
          const resContact = await axios.get(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=email,lifecyclestage`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const props = resContact.data.properties || {};
          const email = props.email;
          const lifecycle = props.lifecyclestage;
          if (email) {
            // find lead by email and update mapping status if beneficial
            const lead = await prisma.lead.findFirst({ where: { email } });
            if (lead) {
              // map lifecyclestage -> lead.status
              let mappedStatus = null;
              if (lifecycle === 'customer' || lifecycle === 'opportunity') mappedStatus = 'WON';
              else if (lifecycle === 'lead' || lifecycle === 'subscriber') mappedStatus = 'CONTACTED';
              if (mappedStatus) {
                await prisma.lead.update({ where: { id: lead.id }, data: { status: mappedStatus } });
              }
            }
          }
        } catch (err) {
          console.error('Failed fetch contact from HubSpot', err?.response?.data || err.message);
        }
      }
    }
  } catch (err) {
    console.error('HubSpot webhook processing error', err);
  }
  res.status(200).send('ok');
});

module.exports = router;
