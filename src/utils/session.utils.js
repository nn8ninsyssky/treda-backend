const jwt = require("jsonwebtoken");
const { callSP } = require("../config/db.postgres");
const { generateTokens } = require("./token.utils");

const createLoginSession = async ({ user, req }) => {
  const tokens = generateTokens(user);

  const result = await callSP(
    `
    SELECT public.sp_create_user_session(
      :session_id::uuid,
      :user_id::uuid,
      :role,
      :access_jti,
      :refresh_jti,
      :refresh_token_hash,
      :access_expires_at,
      :refresh_expires_at,
      :ip_address,
      :user_agent
    ) AS response
    `,
    {
      session_id: tokens.sessionId,
      user_id: user.id,
      role: user.role,
      access_jti: tokens.accessJti,
      refresh_jti: tokens.refreshJti,
      refresh_token_hash: tokens.refreshTokenHash,
      access_expires_at: tokens.accessExpiresAt,
      refresh_expires_at: tokens.refreshExpiresAt,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"] || null,
    }
  );

  const response = result?.[0]?.response;

  if (!response || !response.success) {
    throw new Error(response?.message || "Failed to create session");
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

module.exports = {
  createLoginSession,
};