// // src/services/slack.js
// const axios = require('axios');

// async function sendSlackMessage(text) {
//   const url = process.env.SLACK_WEBHOOK_URL;
//   if (!url) {
//     // integration disabled
//     console.log('Slack webhook not configured; skipping slack message.');
//     return null;
//   }
//   try {
//     const res = await axios.post(url, { text });
//     return res.data;
//   } catch (err) {
//     console.error('Slack send error', err?.response?.data || err.message);
//     return null;
//   }
// }

// module.exports = { sendSlackMessage };
// src/services/slack.js
const axios = require('axios');
const qs = require('qs');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

async function sendSlackMessage(text, lead) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('Slack webhook not configured; skipping slack message.');
    return null;
  }
  // message with interactive buttons: use blocks with action buttons that point to our backend (we will use "value" to pass lead id)
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text } },
    {
      type: 'actions',
      elements: [
        { type: 'button', text: { type: 'plain_text', text: 'Claim' }, action_id: 'claim_lead', value: String(lead.id) },
        { type: 'button', text: { type: 'plain_text', text: 'Mark Won' }, style: 'primary', action_id: 'mark_won', value: String(lead.id) },
        { type: 'button', text: { type: 'plain_text', text: 'Mark Lost' }, style: 'danger', action_id: 'mark_lost', value: String(lead.id) }
      ]
    }
  ];
  try {
    const res = await axios.post(SLACK_WEBHOOK_URL, { blocks });
    return res.data;
  } catch (err) {
    console.error('Slack send error', err?.response?.data || err.message);
    return null;
  }
}

module.exports = { sendSlackMessage };
