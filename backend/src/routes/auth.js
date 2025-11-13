// const express = require('express');
// const bcrypt = require('bcrypt');
// const prisma = require('../prismaClient');
// const { generateToken, requireAuth, optional } = require('../middleware/auth');

// const router = express.Router();

// // register - NOTE: In production restrict to ADMIN or initial seed.
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) return res.status(400).json({ error: 'Email already in use' });

//     const hash = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, password: hash, role: role || 'SALES' }
//     });

//     const token = generateToken(user);
//     res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.status(400).json({ error: 'Invalid credentials' });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

//     const token = generateToken(user);
//     res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // me
// router.get('/me', optional, async (req, res) => {
//   if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
//   const { id, name, email, role, createdAt } = req.user;
//   res.json({ user: { id, name, email, role, createdAt } });
// });

// module.exports = router;
// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { generateToken } = require('../middleware/auth');
const { z } = require('zod');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// register
router.post('/register', async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const { name, email, password, role } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, role: role || 'SALES' }
    });

    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// me
router.get('/me', async (req, res) => {
  // optional token allowed; check header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });
  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { id, name, email, role, createdAt } = user;
    res.json({ user: { id, name, email, role, createdAt } });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
