const crypto = require("crypto");
const prisma = require("../config/db");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateTrainerCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Array.from(
      { length: 6 },
      () => CHARS[crypto.randomInt(0, CHARS.length)],
    ).join("");

    const existing = await prisma.trainerProfile.findUnique({
      where: { trainerCode: code },
    });

    if (!existing) return code;
  }

  throw new Error("Could not generate unique trainer code after 10 attempts");
}

module.exports = generateTrainerCode;
