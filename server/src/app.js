const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const traineeRoutes = require("./routes/traineeRoutes");
const presetRoutes = require("./routes/presetRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const progressRoutes = require("./routes/progressRoutes");
const adminRoutes = require("./routes/adminRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const templateRoutes = require("./routes/templateRoutes");
const foodRoutes = require("./routes/foodRoutes");
const dietTemplateRoutes = require("./routes/dietTemplateRoutes");
const coachingRoutes = require("./routes/coachingRoutes");
const exerciseHistoryRoutes = require("./routes/exerciseHistoryRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({ service: "La Traino API", status: "running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trainee", traineeRoutes);
app.use("/api/trainee", presetRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/trainer/templates", templateRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/trainer/diet-templates", dietTemplateRoutes);
app.use("/api/trainer/coaching", coachingRoutes);
app.use("/api/trainee", exerciseHistoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
  void next;
});

module.exports = app;
