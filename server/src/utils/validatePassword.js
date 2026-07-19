function validatePassword(password) {
  if (!password || password.length < 8) {
    throw Object.assign(new Error("Password must be at least 8 characters"), {
      status: 400,
    });
  }
  if (!/[A-Z]/.test(password)) {
    throw Object.assign(
      new Error("Password must contain at least one uppercase letter"),
      { status: 400 },
    );
  }
  if (!/[a-z]/.test(password)) {
    throw Object.assign(
      new Error("Password must contain at least one lowercase letter"),
      { status: 400 },
    );
  }
  if (!/[0-9]/.test(password)) {
    throw Object.assign(new Error("Password must contain at least one number"), {
      status: 400,
    });
  }
  return true;
}

module.exports = { validatePassword };
