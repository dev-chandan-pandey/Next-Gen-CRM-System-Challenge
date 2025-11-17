// src/middleware/slackVerify.js
const crypto = require('crypto');

function verifySlackRequest(req, res, next) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return next(); // dev: skip if not set

  // Slack sends signature in headers and body as raw string; Express's body parsers break raw body.
  // To use this middleware, ensure in app you capture raw body (see below). For simplicity, we will
  // accept requests when SIGNING_SECRET missing. If present, we'll try verify using req.rawBody.
  const timestamp = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  if (!timestamp || !sig || !req.rawBody) {
    return res.status(400).send('Invalid Slack request (missing headers/raw body)');
  }

  // prevent replay attacks
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - Number(timestamp)) > 60 * 5) {
    return res.status(400).send('Ignored Slack request: timestamp too old');
  }

  const basestring = `v0:${timestamp}:${req.rawBody}`;
  const hmac = crypto.createHmac('sha256', signingSecret).update(basestring).digest('hex');
  const computed = `v0=${hmac}`;

  if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sig))) {
    return res.status(401).send('Invalid signature');
  }

  next();
}

module.exports = verifySlackRequest;
