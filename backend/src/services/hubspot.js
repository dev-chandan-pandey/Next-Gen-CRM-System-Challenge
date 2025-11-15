// // src/services/hubspot.js
// const axios = require('axios');

// async function pushLeadToHubSpot(lead) {
//   const url = process.env.HUBSPOT_WEBHOOK_URL;
//   if (!url) {
//     console.log('HubSpot webhook not configured; skipping push.');
//     return null;
//   }
//   try {
//     const res = await axios.post(url, { lead });
//     return res.data;
//   } catch (err) {
//     console.error('HubSpot push error', err?.response?.data || err.message);
//     return null;
//   }
// }

// module.exports = { pushLeadToHubSpot };
// src/services/hubspot.js
const axios = require('axios');
const prisma = require('../prismaClient');
const qs = require('qs');

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI; // e.g. https://yourdomain.com/api/v1/integrations/hubspot/callback

async function exchangeCodeForTokens(code) {
  const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
  const body = qs.stringify({
    grant_type: 'authorization_code',
    client_id: HUBSPOT_CLIENT_ID,
    client_secret: HUBSPOT_CLIENT_SECRET,
    redirect_uri: HUBSPOT_REDIRECT_URI,
    code
  });
  const res = await axios.post(tokenUrl, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data; // { access_token, refresh_token, expires_in, ... }
}

async function refreshTokens(refreshToken) {
  const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
  const body = qs.stringify({
    grant_type: 'refresh_token',
    client_id: HUBSPOT_CLIENT_ID,
    client_secret: HUBSPOT_CLIENT_SECRET,
    refresh_token: refreshToken
  });
  const res = await axios.post(tokenUrl, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data;
}

async function saveTokensToDb(tokens) {
  const expiresAt = tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000) : null;
  const existing = await prisma.hubSpotIntegration.findFirst();
  if (existing) {
    return prisma.hubSpotIntegration.update({
      where: { id: existing.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope
      }
    });
  } else {
    return prisma.hubSpotIntegration.create({
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope
      }
    });
  }
}

/**
 * pushLeadToHubSpot: create or update contact in HubSpot using stored integration tokens.
 * This is a best-effort call: it will attempt refresh if token expired.
 */
async function pushLeadToHubSpot(lead) {
  const integration = await prisma.hubSpotIntegration.findFirst();
  if (!integration) {
    console.log('No HubSpot integration configured');
    return null;
  }

  let token = integration.accessToken;
  // if expires and expired -> refresh
  if (integration.expiresAt && new Date(integration.expiresAt) <= new Date()) {
    try {
      const refreshed = await refreshTokens(integration.refreshToken);
      await saveTokensToDb(refreshed);
      token = refreshed.access_token;
    } catch (err) {
      console.error('HubSpot token refresh failed', err?.response?.data || err.message);
      throw err;
    }
  }

  // Basic create contact endpoint
  try {
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const body = {
      properties: {
        email: lead.email || '',
        firstname: lead.name || '',
        phone: lead.phone || '',
        lifecyclestage: lead.status || 'lead',
        source: lead.source || ''
      }
    };
    const res = await axios.post(url, body, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    console.error('HubSpot push error', err?.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  exchangeCodeForTokens,
  saveTokensToDb,
  pushLeadToHubSpot,
  refreshTokens
};
