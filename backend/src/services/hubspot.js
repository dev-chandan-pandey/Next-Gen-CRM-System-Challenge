// src/services/hubspot.js
const axios = require('axios');

async function pushLeadToHubSpot(lead) {
  const url = process.env.HUBSPOT_WEBHOOK_URL;
  if (!url) {
    console.log('HubSpot webhook not configured; skipping push.');
    return null;
  }
  try {
    const res = await axios.post(url, { lead });
    return res.data;
  } catch (err) {
    console.error('HubSpot push error', err?.response?.data || err.message);
    return null;
  }
}

module.exports = { pushLeadToHubSpot };
