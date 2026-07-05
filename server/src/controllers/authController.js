const authService = require("../services/authService");

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });
  res.status(201).json(result);
}

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json(result);
}

async function googleAuth(req, res) {
  const { credentialToken, role } = req.body;
  const result = await authService.googleAuth({ credentialToken, role });
  res.json(result);
}

async function getMe(req, res) {
  const result = await authService.getMe(req.user.userId);
  res.json(result);
}

module.exports = { register, login, googleAuth, getMe };
