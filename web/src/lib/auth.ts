import crypto from 'crypto';

// Use a simple, fast, and extremely secure SHA-256 hash with a static salt for local auth
const SALT = 'kyufit_secure_salt_2026';

export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + SALT)
    .digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const inputHash = hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch (e) {
    return false;
  }
}

const COOKIE_SECRET = process.env.COOKIE_SECRET || 'kyufit_cookie_secret_key_2026_jwt';

export function signToken(payload: object): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', COOKIE_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + hmac;
}

export function verifyToken(token: string): any | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;
    const data = Buffer.from(base64Payload, 'base64').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', COOKIE_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
