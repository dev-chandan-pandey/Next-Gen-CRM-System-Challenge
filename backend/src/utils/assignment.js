// src/utils/assignment.js
const prisma = require('../prismaClient');

let lastIndex = -1;

/**
 * getNextSalesUser - find sales users and round-robin pick next
 * returns user id or null if none found
 */
async function getNextSalesUser() {
  const salesUsers = await prisma.user.findMany({
    where: { role: 'SALES' },
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true }
  });

  if (!salesUsers || salesUsers.length === 0) return null;
  lastIndex = (lastIndex + 1) % salesUsers.length;
  return salesUsers[lastIndex];
}

module.exports = { getNextSalesUser };
