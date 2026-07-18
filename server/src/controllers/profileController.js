const profileService = require("../services/profileService");

async function getProfile(req, res) {
  const result = await profileService.getProfile(req.user.userId);
  res.json(result);
}

async function updateProfile(req, res) {
  const result = await profileService.updateProfile(req.user.userId, req.body);
  res.json(result);
}

async function uploadAvatar(req, res) {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Image data is required" });
  }
  const result = await profileService.uploadAvatar(req.user.userId, image);
  res.json(result);
}

module.exports = { getProfile, updateProfile, uploadAvatar };
