// // src/utils/assignment.js
// const prisma = require('../prismaClient');

// let lastIndex = -1;

// /**
//  * getNextSalesUser - find sales users and round-robin pick next
//  * returns user id or null if none found
//  */
// async function getNextSalesUser() {
//   const salesUsers = await prisma.user.findMany({
//     where: { role: 'SALES' },
//     orderBy: { id: 'asc' },
//     select: { id: true, name: true, email: true }
//   });

//   if (!salesUsers || salesUsers.length === 0) return null;
//   lastIndex = (lastIndex + 1) % salesUsers.length;
//   return salesUsers[lastIndex];
// }

// module.exports = { getNextSalesUser };
// src/utils/assignment.js
const prisma = require('../prismaClient');

const ROTATION_KEY = 'rotation_index';

async function _getRotationIndex() {
  const meta = await prisma.meta.findUnique({ where: { key: ROTATION_KEY } });
  if (!meta) return null;
  return Number(meta.value);
}

async function _setRotationIndex(idx) {
  // upsert meta
  await prisma.meta.upsert({
    where: { key: ROTATION_KEY },
    create: { key: ROTATION_KEY, value: String(idx) },
    update: { value: String(idx) }
  });
}

/**
 * getNextSalesUser - pick next SALES user in a DB-backed round-robin.
 * returns user object or null
 */
async function getNextSalesUser() {
  const salesUsers = await prisma.user.findMany({
    where: { role: 'SALES' },
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true }
  });

  if (!salesUsers || salesUsers.length === 0) return null;

  let lastIndex = await _getRotationIndex();
  if (lastIndex === null || isNaN(lastIndex)) lastIndex = -1;

  // compute next index
  const nextIndex = (lastIndex + 1) % salesUsers.length;
  const nextUser = salesUsers[nextIndex];

  await _setRotationIndex(nextIndex);
  return nextUser;
}

module.exports = { getNextSalesUser };
