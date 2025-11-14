// src/services/slack.js
const axios = require('axios');

async function sendSlackMessage(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    // integration disabled
    console.log('Slack webhook not configured; skipping slack message.');
    return null;
  }
  try {
    const res = await axios.post(url, { text });
    return res.data;
  } catch (err) {
    console.error('Slack send error', err?.response?.data || err.message);
    return null;
  }
}

module.exports = { sendSlackMessage };
