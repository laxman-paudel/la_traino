require("dotenv/config");
const app = require("./src/app");
const prisma = require("./src/config/db");

const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/db-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, db: "connected" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});