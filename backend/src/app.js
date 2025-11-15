// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const hubspotIntegrationRoutes = require('./routes/integrations/hubspot');
const slackRoutes = require('./routes/integrations/slack');
const app = express();

app.use(cors());
app.use(express.json());

// API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/integrations/hubspot', hubspotIntegrationRoutes);
app.use('/api/v1/integrations/slack', slackRoutes);
app.get('/', (req, res) => res.json({ ok: true, msg: 'NextGen CRM backend' }));

module.exports = app;
