const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { generateToken, requireAuth, optional } = require('../middleware/auth');

const router = express.Router();

// register - NOTE: In production restrict to ADMIN or initial seed.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

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
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

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
router.get('/me', optional, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { id, name, email, role, createdAt } = req.user;
  res.json({ user: { id, name, email, role, createdAt } });
});

module.exports = router;
