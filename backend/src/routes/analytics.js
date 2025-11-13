// src/routes/analytics.js
const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Public (or protected) route: leads by day for last `range` days (default 30)
router.get('/leads-by-day', requireAuth, async (req, res) => {
  try {
    const range = Number(req.query.range || 30);
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - range + 1);

    // group by date
    const raw = await prisma.$queryRawUnsafe(`
      SELECT to_char("createdAt"::date, 'YYYY-MM-DD') as day, count(*)::int as count
      FROM "Lead"
      WHERE "createdAt" >= $1
      GROUP BY day
      ORDER BY day;
    `, from);

    res.json({ data: raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Conversion: overall conversion rate (won / total)
router.get('/conversion', requireAuth, async (req, res) => {
  try {
    const total = await prisma.lead.count();
    const won = await prisma.lead.count({ where: { status: 'WON' } });
    const conversionRate = total === 0 ? 0 : (won / total) * 100;
    res.json({ total, won, conversionRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
