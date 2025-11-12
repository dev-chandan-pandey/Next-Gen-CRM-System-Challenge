const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function generateToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// middleware to require auth
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // load fresh user from DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// optional auth: if token present, attach req.user, else continue
async function optional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user) req.user = user;
  } catch (_) { /* ignore */ }
  return next();
}

// roles authorization
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = {
  generateToken,
  requireAuth,
  optional,
  authenticateJWT: { require: requireAuth, optional },
  authorizeRoles
};
