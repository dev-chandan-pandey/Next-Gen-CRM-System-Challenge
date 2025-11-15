// src/routes/integrations/slack.js
const express = require('express');
const crypto = require('crypto');
const prisma = require('../../prismaClient');

const router = express.Router();
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

function verifySlackRequest(req) {
  // Rudimentary verification using signing secret and raw body: if you use express.json() earlier this won't have raw body.
  // For robust verification, use @slack/events-api or capture raw body via middleware.
  return true; // for dev, bypass. For production implement full verification per Slack docs.
}

// Action handler
router.post('/actions', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    // Slack sends payload as form-encoded field "payload"
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions && payload.actions[0];
    if (!action) return res.status(400).send('No action');

    const leadId = Number(action.value);
    if (action.action_id === 'claim_lead') {
      // claim: set owner by finding user by slack user mapping (not implemented) -> fallback: set owner to first SALES
      const sales = await prisma.user.findFirst({ where: { role: 'SALES' } });
      if (sales) {
        const updated = await prisma.lead.update({ where: { id: leadId }, data: { ownerId: sales.id } });
        // respond with an ephemeral message
        return res.json({ text: `Lead ${updated.name} claimed by ${sales.name}` });
      }
    } else if (action.action_id === 'mark_won') {
      const updated = await prisma.lead.update({ where: { id: leadId }, data: { status: 'WON' } });
      return res.json({ text: `Lead ${updated.name} marked WON` });
    } else if (action.action_id === 'mark_lost') {
      const updated = await prisma.lead.update({ where: { id: leadId }, data: { status: 'LOST' } });
      return res.json({ text: `Lead ${updated.name} marked LOST` });
    }

    res.json({ text: 'Action handled' });
  } catch (err) {
    console.error('Slack action error', err);
    res.status(500).send('error');
  }
});

module.exports = router;
