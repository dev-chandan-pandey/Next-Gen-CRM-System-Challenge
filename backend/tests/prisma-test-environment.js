const { PrismaClient } = require('@prisma/client');
const { newDb } = require('pg-mem');

module.exports = async function setupTestDB() {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  // create pg adapter for Prisma
  const adapter = db.adapters.createPgPromise();
  const connectionString = adapter.$uri();

  process.env.DATABASE_URL = connectionString;

  // run Prisma migrations programmatically
  const { execSync } = require("child_process");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const prisma = new PrismaClient();
  return prisma;
};
