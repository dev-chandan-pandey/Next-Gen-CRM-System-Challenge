const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// List leads - supports simple filters: ownerId, status, search
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

// Create lead
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, status, ownerId, source, value } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        status: status ? status.toUpperCase() : undefined,
        ownerId: ownerId ? Number(ownerId) : req.user.id,
        source,
        value: value ? Number(value) : undefined
      },
      include: { owner: true }
    });

    // emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to('global').emit('notification:new_lead', { lead });
    }

    res.status(201).json({ lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lead detail (with activities)
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
    const id = Number(req.params.id);
    const { name, email, phone, status, ownerId, source, value } = req.body;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status: status ? status.toUpperCase() : undefined,
        ownerId: ownerId ? Number(ownerId) : undefined,
        source,
        value: value !== undefined ? Number(value) : undefined
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

// Delete lead
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

// Activities: add activity
router.post('/:id/activities', requireAuth, async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const { type, content, meta } = req.body;
    if (!type) return res.status(400).json({ error: 'Activity type required' });

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

    // optional: update lead status if activity is STATUS_CHANGE and meta has newStatus
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
