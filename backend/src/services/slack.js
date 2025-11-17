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
// const axios = require('axios');
// const qs = require('qs');

// const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
// const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

// async function sendSlackMessage(text, lead) {
//   if (!SLACK_WEBHOOK_URL) {
//     console.log('Slack webhook not configured; skipping slack message.');
//     return null;
//   }
//   // message with interactive buttons: use blocks with action buttons that point to our backend (we will use "value" to pass lead id)
//   const blocks = [
//     { type: 'section', text: { type: 'mrkdwn', text } },
//     {
//       type: 'actions',
//       elements: [
//         { type: 'button', text: { type: 'plain_text', text: 'Claim' }, action_id: 'claim_lead', value: String(lead.id) },
//         { type: 'button', text: { type: 'plain_text', text: 'Mark Won' }, style: 'primary', action_id: 'mark_won', value: String(lead.id) },
//         { type: 'button', text: { type: 'plain_text', text: 'Mark Lost' }, style: 'danger', action_id: 'mark_lost', value: String(lead.id) }
//       ]
//     }
//   ];
//   try {
//     const res = await axios.post(SLACK_WEBHOOK_URL, { blocks });
//     return res.data;
//   } catch (err) {
//     console.error('Slack send error', err?.response?.data || err.message);
//     return null;
//   }
// }

// module.exports = { sendSlackMessage };
// src/services/slack.js
const axios = require('axios');

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.log('SLACK_BOT_TOKEN not provided — slack bot disabled.');
}

async function postMessageToSlackChannel(channel, blocks, text = '') {
  if (!BOT_TOKEN) {
    console.log('Slack bot token missing; skipping post.');
    return null;
  }
  try {
    const res = await axios.post('https://slack.com/api/chat.postMessage', {
      channel,
      text,
      blocks
    }, {
      headers: {
        Authorization: `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.data.ok) {
      console.error('Slack API error', res.data);
    }
    return res.data;
  } catch (err) {
    console.error('Slack postMessage error', err?.response?.data || err.message);
    throw err;
  }
}

/**
 * sendLeadNotification - sends an interactive message with Claim / Mark Won / Mark Lost buttons
 * channel: slack channel id (string) OR use default channel from env (SLACK_CHANNEL_ID)
 * lead: lead object
 */
async function sendLeadNotification(lead, channel = process.env.SLACK_CHANNEL_ID) {
  if (!channel) {
    console.log('No Slack channel configured, skipping slack post.');
    return null;
  }

  const blocks = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*New Lead:* ${lead.name}\n*Status:* ${lead.status}\n*Email:* ${lead.email || 'N/A'}\n*Owner:* ${lead.owner?.name || 'unassigned'}` }
    },
    {
      type: 'actions',
      elements: [
        { type: 'button', text: { type: 'plain_text', text: 'Claim' }, action_id: 'claim_lead', value: String(lead.id) },
        { type: 'button', text: { type: 'plain_text', text: 'Mark Won' }, style: 'primary', action_id: 'mark_won', value: String(lead.id) },
        { type: 'button', text: { type: 'plain_text', text: 'Mark Lost' }, style: 'danger', action_id: 'mark_lost', value: String(lead.id) }
      ]
    }
  ];

  return postMessageToSlackChannel(channel, blocks, `New lead: ${lead.name}`);
}

module.exports = { sendLeadNotification, postMessageToSlackChannel };
