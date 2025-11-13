// src/routes/users.js
const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const { z } = require('zod');

const router = express.Router();

// All user management endpoints require authentication and ADMIN role
router.use(requireAuth);
router.use(authorizeRoles('ADMIN'));

// List users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const roleSchema = z.object({
  role: z.enum(['ADMIN','MANAGER','SALES'])
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const parse = roleSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const id = Number(req.params.id);
    const { role } = parse.data;

    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({ user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
