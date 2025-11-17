// const express = require('express');
// const prisma = require('../prismaClient');
// const { requireAuth } = require('../middleware/auth');

// const router = express.Router();

// // List leads - supports simple filters: ownerId, status, search
// router.get('/', async (req, res) => {
//   try {
//     const { ownerId, status, search, take = 50, skip = 0 } = req.query;
//     const where = {};
//     if (ownerId) where.ownerId = Number(ownerId);
//     if (status) where.status = status.toUpperCase();
//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: 'insensitive' } },
//         { email: { contains: search, mode: 'insensitive' } },
//         { phone: { contains: search, mode: 'insensitive' } }
//       ];
//     }
//     const leads = await prisma.lead.findMany({
//       where,
//       take: Number(take),
//       skip: Number(skip),
//       orderBy: { createdAt: 'desc' },
//       include: { owner: { select: { id: true, name: true, email: true } } }
//     });
//     res.json({ leads });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create lead
// router.post('/', requireAuth, async (req, res) => {
//   try {
//     const { name, email, phone, status, ownerId, source, value } = req.body;
//     if (!name) return res.status(400).json({ error: 'Name required' });

//     const lead = await prisma.lead.create({
//       data: {
//         name,
//         email,
//         phone,
//         status: status ? status.toUpperCase() : undefined,
//         ownerId: ownerId ? Number(ownerId) : req.user.id,
//         source,
//         value: value ? Number(value) : undefined
//       },
//       include: { owner: true }
//     });

//     // emit socket notification
//     const io = req.app.get('io');
//     if (io) {
//       io.to('global').emit('notification:new_lead', { lead });
//     }

//     res.status(201).json({ lead });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get lead detail (with activities)
// router.get('/:id', async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const lead = await prisma.lead.findUnique({
//       where: { id },
//       include: {
//         owner: { select: { id: true, name: true, email: true } },
//         activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } }
//       }
//     });
//     if (!lead) return res.status(404).json({ error: 'Lead not found' });
//     res.json({ lead });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Update lead
// router.put('/:id', requireAuth, async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const { name, email, phone, status, ownerId, source, value } = req.body;

//     const lead = await prisma.lead.update({
//       where: { id },
//       data: {
//         name,
//         email,
//         phone,
//         status: status ? status.toUpperCase() : undefined,
//         ownerId: ownerId ? Number(ownerId) : undefined,
//         source,
//         value: value !== undefined ? Number(value) : undefined
//       },
//       include: { owner: true }
//     });

//     const io = req.app.get('io');
//     if (io) io.to('global').emit('notification:lead_updated', { lead });

//     res.json({ lead });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Delete lead
// router.delete('/:id', requireAuth, async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     await prisma.lead.delete({ where: { id } });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Activities: add activity
// router.post('/:id/activities', requireAuth, async (req, res) => {
//   try {
//     const leadId = Number(req.params.id);
//     const { type, content, meta } = req.body;
//     if (!type) return res.status(400).json({ error: 'Activity type required' });

//     const activity = await prisma.activity.create({
//       data: {
//         leadId,
//         userId: req.user.id,
//         type,
//         content,
//         meta: meta || {}
//       },
//       include: { user: { select: { id: true, name: true } } }
//     });

//     // optional: update lead status if activity is STATUS_CHANGE and meta has newStatus
//     if (type === 'STATUS_CHANGE' && meta && meta.newStatus) {
//       await prisma.lead.update({ where: { id: leadId }, data: { status: meta.newStatus } });
//     }

//     res.status(201).json({ activity });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;
// src/routes/leads.js
const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { z } = require('zod');
const { sendMail } = require('../services/mail');
const { getNextSalesUser } = require('../utils/assignment');
const { sendSlackMessage } = require('../services/slack');
const { pushLeadToHubSpot } = require('../services/hubspot');
const { sendLeadNotification } = require('../services/slack');

const router = express.Router();

// Apply optionalAuth globally to allow public read when no token provided
router.use(optionalAuth);

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['NEW','CONTACTED','QUALIFIED','WON','LOST']).optional(),
  ownerId: z.number().optional(),
  source: z.string().optional(),
  value: z.number().optional()
});

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['NEW','CONTACTED','QUALIFIED','WON','LOST']).optional(),
  ownerId: z.number().optional(),
  source: z.string().optional(),
  value: z.number().optional()
});

// List
router.get('/', async (req, res) => {
  try {
    const { ownerId, status, search, take = 50, skip = 0 } = req.query;
    const where = {};
    if (ownerId) where.ownerId = Number(ownerId);
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    const leads = await prisma.lead.findMany({
      where,
      take: Number(take),
      skip: Number(skip),
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true } } }
    });
    res.json({ leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const parse = createLeadSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const { name, email, phone, status, ownerId, source, value } = parse.data;
      // Auto-assign if owner missing and AUTO_ASSIGN_ROTATION enabled
    if (!ownerId && (process.env.AUTO_ASSIGN_ROTATION || 'true') === 'true') {
      const next = await getNextSalesUser();
      if (next) {
        ownerId = next.id;
        console.log('Auto-assigned lead to user', next.email);
      }
    }
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        status: status ? status.toUpperCase() : undefined,
        ownerId: ownerId ? Number(ownerId) : req.user.id,
        source,
        value
      },
      include: { owner: true }
    });
 // ✅ Send notification email to owner
    // const owner = lead.owner;
    // after lead created:
// if (owner && owner.email) {
//   const preview = await sendMail({
//     to: owner.email,
//     subject: `New Lead Assigned: ${lead.name}`,
//     text: `A new lead "${lead.name}" has been assigned to you.`,
//     html: `<p>A new lead "<b>${lead.name}</b>" has been assigned to you.</p>`
//   });
//   // optionally include preview link in response (dev)
//   console.log('email preview url', preview);
// }
    
    // emit notification
    const io = req.app.get('io');
    if (io) io.to('global').emit('notification:new_lead', { lead });
   // Send Slack notification (if configured)
    try {
      const text = `*New Lead:* ${lead.name}\n*Status:* ${lead.status}\n*Owner:* ${lead.owner?.name || 'unassigned'}\n*Email:* ${lead.email || 'N/A'}`;
      // await sendSlackMessage(text);
       await sendLeadNotification(text);
    } catch (err) { console.error('Slack notify failed', err); }
     // Send email to owner (if owner has email)
    try {
      if (lead.owner && lead.owner.email) {
        const preview = await sendMail({
          to: lead.owner.email,
          subject: `New Lead Assigned: ${lead.name}`,
          text: `A new lead "${lead.name}" has been assigned to you.`,
          html: `<p>A new lead "<b>${lead.name}</b>" has been assigned to you.</p>`
        });
        if (preview) console.log('Email preview URL', preview);
      }
    } catch (err) { console.error('Email send failed', err); }

     // Push to HubSpot (if configured)
    try {
      await pushLeadToHubSpot(lead);
    } catch (err) { console.error('HubSpot push failed', err); }

    res.status(201).json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detail
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } }
      }
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update lead
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const parse = updateLeadSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const id = Number(req.params.id);
    const data = parse.data;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? data.status.toUpperCase() : undefined
      },
      include: { owner: true }
    });

    const io = req.app.get('io');
    if (io) io.to('global').emit('notification:lead_updated', { lead });

    res.json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.lead.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Activities
const activitySchema = z.object({
  type: z.enum(['NOTE', 'CALL', 'MEETING', 'STATUS_CHANGE']),
  content: z.string().optional(),
  meta: z.any().optional()
});

router.post('/:id/activities', requireAuth, async (req, res) => {
  try {
    const parse = activitySchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const leadId = Number(req.params.id);
    const { type, content, meta } = parse.data;

    const activity = await prisma.activity.create({
      data: {
        leadId,
        userId: req.user.id,
        type,
        content,
        meta: meta || {}
      },
      include: { user: { select: { id: true, name: true } } }
    });

    // update lead status if status change provided
    if (type === 'STATUS_CHANGE' && meta && meta.newStatus) {
      await prisma.lead.update({ where: { id: leadId }, data: { status: meta.newStatus } });
    }

    res.status(201).json({ activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
