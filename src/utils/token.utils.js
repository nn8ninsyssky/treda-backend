const jwt = require('jsonwebtoken');

const generateAccessToken = user => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    }
  );
};

const generateRefreshToken = user => {
  return jwt.sign(
    {
      id: user.id,
      tokenType: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

const generateTokens = user => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
};