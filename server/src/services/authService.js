const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/db");
const generateTrainerCode = require("../utils/generateTrainerCode");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  authProvider: true,
  profileImage: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  trainerProfile: {
    select: { trainerCode: true, bio: true, specialties: true },
  },
  traineeProfile: {
    select: {
      fitnessGoal: true,
      selectedPresetId: true,
      selectedPreset: { select: { name: true, description: true } },
    },
  },
  traineeLinks: {
    select: {
      trainer: {
        select: {
          id: true,
          name: true,
          trainerProfile: { select: { trainerCode: true } },
        },
      },
    },
  },
};

async function register({ name, email, password, role }) {
  if (!name || !name.trim()) {
    throw Object.assign(new Error("Name is required"), { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Valid email is required"), { status: 400 });
  }
  if (!password || password.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters"), {
      status: 400,
    });
  }
  const normalizedRole = role?.toUpperCase();
  if (!["TRAINER", "TRAINEE"].includes(normalizedRole)) {
    throw Object.assign(new Error("Role must be TRAINER or TRAINEE"), {
      status: 400,
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: normalizedRole,
      authProvider: "LOCAL",
      trainerProfile:
        normalizedRole === "TRAINER"
          ? { create: { trainerCode: await generateTrainerCode() } }
          : undefined,
      traineeProfile: normalizedRole === "TRAINEE" ? { create: {} } : undefined,
    },
    select: USER_SELECT,
  });

  const token = signToken(user);

  return { token, user };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error("Email and password are required"), {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { ...USER_SELECT, password: true },
  });

  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });
  }

  if (!user.isActive) {
    throw Object.assign(new Error("Account has been disabled"), {
      status: 401,
    });
  }

  if (user.authProvider !== "LOCAL" || !user.password) {
    throw Object.assign(
      new Error("This account uses Google login. Please sign in with Google."),
      { status: 400 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });
  }

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  const token = signToken(user);

  return { token, user: userWithoutPassword };
}

async function googleAuth({ credentialToken, role }) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credentialToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw Object.assign(new Error("Invalid Google credential"), {
      status: 401,
    });
  }

  const { email, name, sub: googleId, picture } = payload;

  let user = await prisma.user.findUnique({
    where: { googleId },
    select: USER_SELECT,
  });

  if (user) {
    if (!user.isActive) {
      throw Object.assign(new Error("Account has been disabled"), {
        status: 401,
      });
    }
    const token = signToken(user);
    return { token, user };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, authProvider: true, isActive: true },
  });

  if (existingByEmail) {
    if (!existingByEmail.isActive) {
      throw Object.assign(new Error("Account has been disabled"), {
        status: 401,
      });
    }

    if (existingByEmail.authProvider !== "GOOGLE") {
      throw Object.assign(
        new Error("This email already belongs to an existing account. Please sign in with your email and password."),
        { status: 409 },
      );
    }

    user = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { googleId, authProvider: "GOOGLE" },
      select: USER_SELECT,
    });

    const token = signToken(user);
    return { token, user };
  }

  const normalizedRole = role?.toUpperCase();
  if (!["TRAINER", "TRAINEE"].includes(normalizedRole)) {
    throw Object.assign(new Error("Role must be TRAINER or TRAINEE"), {
      status: 400,
    });
  }

  user = await prisma.user.create({
    data: {
      name,
      email,
      googleId,
      profileImage: picture || null,
      role: normalizedRole,
      authProvider: "GOOGLE",
      trainerProfile:
        normalizedRole === "TRAINER"
          ? { create: { trainerCode: await generateTrainerCode() } }
          : undefined,
      traineeProfile: normalizedRole === "TRAINEE" ? { create: {} } : undefined,
    },
    select: USER_SELECT,
  });

  const token = signToken(user);
  return { token, user };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error("Account has been disabled"), {
      status: 401,
    });
  }

  return { user };
}

module.exports = { register, login, googleAuth, getMe };
