import {SignJWT, jwtVerify} from 'jose';

const encoder = new TextEncoder();

function getSecret(env) {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET no configurado");
  return encoder.encode(env.JWT_SECRET);
}

export async function signJwt(payload, env) {
  const expiresIn = env.JWT_EXPIRES_IN || "7d";
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(env));
}

export async function verifyJwt(token, env, options = {}) {
  const result = await jwtVerify(token, getSecret(env), options);
  return result.payload;
}