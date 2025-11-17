// src/routes/admin/slackMapping.js
const express = require('express');
const prisma = require('../../prismaClient');
const { requireAuth, authorizeRoles } = require('../../middleware/auth');
const { z } = require('zod');

const router = express.Router();

router.use(requireAuth);
router.use(authorizeRoles('ADMIN'));

router.get('/', async (req, res) => {
  const list = await prisma.slackUser.findMany({ include: { user: true } });
  res.json({ mappings: list });
});

const mapSchema = z.object({
  slackId: z.string().min(1),
  userId: z.number()
});

router.post('/', async (req, res) => {
  const parse = mapSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { slackId, userId } = parse.data;
  const m = await prisma.slackUser.upsert({
    where: { slackId },
    create: { slackId, userId },
    update: { userId }
  });
  res.json({ mapping: m });
});

router.delete('/:slackId', async (req, res) => {
  const slackId = req.params.slackId;
  await prisma.slackUser.delete({ where: { slackId } });
  res.json({ ok: true });
});

module.exports = router;
