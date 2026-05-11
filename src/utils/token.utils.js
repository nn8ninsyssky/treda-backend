const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const parseExpiryToSeconds = (value, fallbackSeconds) => {
  if (!value) return fallbackSeconds;

  const text = String(value).trim();

  if (/^\d+$/.test(text)) {
    return Number(text);
  }

  const match = text.match(/^(\d+)(s|m|h|d)$/);

  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const unit = match[2];

  if (unit === "s") return amount;
  if (unit === "m") return amount * 60;
  if (unit === "h") return amount * 60 * 60;
  if (unit === "d") return amount * 24 * 60 * 60;

  return fallbackSeconds;
};

const getFutureDate = (seconds) => {
  return new Date(Date.now() + seconds * 1000);
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateAccessToken = (user, sessionId, accessJti) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      session_id: sessionId,
      jti: accessJti,
      tokenType: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30m",
    }
  );
};

const generateRefreshToken = (user, sessionId, refreshJti) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing");
  }

  return jwt.sign(
    {
      id: user.id,
      session_id: sessionId,
      jti: refreshJti,
      tokenType: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    }
  );
};

const generateTokens = (user, existingSessionId = null) => {
  const sessionId = existingSessionId || crypto.randomUUID();

  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();

  const accessToken = generateAccessToken(user, sessionId, accessJti);
  const refreshToken = generateRefreshToken(user, sessionId, refreshJti);

  const accessExpiresInSeconds = parseExpiryToSeconds(
    process.env.JWT_EXPIRES_IN || "30m",
    30 * 60
  );

  const refreshExpiresInSeconds = parseExpiryToSeconds(
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    7 * 24 * 60 * 60
  );

  return {
    sessionId,
    accessJti,
    refreshJti,
    accessToken,
    refreshToken,
    accessTokenHash: hashToken(accessToken),
    refreshTokenHash: hashToken(refreshToken),
    accessExpiresAt: getFutureDate(accessExpiresInSeconds),
    refreshExpiresAt: getFutureDate(refreshExpiresInSeconds),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  hashToken,
};