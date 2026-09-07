import prisma from './prisma';
import { hashPassword } from './auth';

export const DEFAULT_WHATSAPP = '6285693553908';

export async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { whatsappNumber: DEFAULT_WHATSAPP },
        { whatsappNumber: `+${DEFAULT_WHATSAPP}` },
        { whatsappNumber: `${DEFAULT_WHATSAPP}@c.us` },
        { whatsappNumber: '085693553908' }
      ]
    }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Rifaldi',
        whatsappNumber: DEFAULT_WHATSAPP,
        email: 'rifaldiadi88@gmail.com',
        passwordHash: hashPassword('parkee@1234'),
        dailyCalorieTarget: 1779,
        targetProteinG: 98,
        targetCarbsG: 237,
        targetFatsG: 49,
        fitnessGoal: 'Cut',
        onboardingComplete: true
      }
    });
  } else {
    // Patch existing user: ensure passwordHash and onboardingComplete are set
    const needsUpdate = !user.passwordHash || !user.onboardingComplete;
    if (needsUpdate) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(!user.passwordHash && { passwordHash: hashPassword('parkee@1234') }),
          ...(!user.onboardingComplete && { onboardingComplete: true })
        }
      });
    }
  }
  return user;
}

export function normalizeWhatsAppNumber(raw: string): string {
  return raw
    .replace(/@c\.us$/, '')
    .replace(/@s\.whatsapp\.net$/, '')
    .replace(/[\s\-\+\(\)]/g, '');
}

export async function findUserByWhatsApp(rawNumber: string) {
  const clean = normalizeWhatsAppNumber(rawNumber);
  if (!clean) return null;

  // Generate common formats (e.g. 6285693553908 vs 085693553908)
  const variants = [clean, `+${clean}`, `${clean}@c.us`, `${clean}@s.whatsapp.net`];
  if (clean.startsWith('62')) {
    variants.push('0' + clean.slice(2));
  } else if (clean.startsWith('0')) {
    variants.push('62' + clean.slice(1));
  }

  return await prisma.user.findFirst({
    where: {
      whatsappNumber: { in: variants }
    }
  });
}

/**
 * Resolves user from Request:
 * 1. Valid session_token cookie (Web UI user)
 * 2. whatsappNumber / phone parameter in body or query (WhatsApp Bot call)
 * 3. Default seed user (Fallback)
 */
export async function resolveUserFromRequest(req: Request, body?: any) {
  const { cookies } = await import('next/headers');
  const { verifyToken } = await import('./auth');

  // 1. Try Cookie Session Token
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });
      if (user) return user;
    }
  }

  // 2. Try WhatsApp Number from body or query params (Bot call)
  const rawWaNumber =
    body?.whatsappNumber ||
    body?.whatsapp ||
    body?.phone ||
    body?.sender;

  if (rawWaNumber) {
    let user = await findUserByWhatsApp(String(rawWaNumber));
    if (!user) {
      // Auto-provision dedicated isolated account for this WhatsApp number!
      const cleanWa = normalizeWhatsAppNumber(String(rawWaNumber));
      user = await prisma.user.create({
        data: {
          whatsappNumber: cleanWa,
          dailyCalorieTarget: 1800,
          targetProteinG: 100,
          targetCarbsG: 225,
          targetFatsG: 50,
          fitnessGoal: 'maintain',
          onboardingComplete: false
        }
      });
    }
    return user;
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryWa = searchParams.get('whatsappNumber') || searchParams.get('phone') || searchParams.get('whatsapp');
    if (queryWa) {
      let user = await findUserByWhatsApp(queryWa);
      if (!user) {
        const cleanWa = normalizeWhatsAppNumber(queryWa);
        user = await prisma.user.create({
          data: {
            whatsappNumber: cleanWa,
            dailyCalorieTarget: 1800,
            targetProteinG: 100,
            targetCarbsG: 225,
            targetFatsG: 50,
            fitnessGoal: 'maintain',
            onboardingComplete: false
          }
        });
      }
      return user;
    }
  } catch (e) {
    // URL parsing might fail on synthetic requests
  }

  // 3. Fallback to default user ONLY if neither session token nor phone number was provided
  return await getOrCreateDefaultUser();
}

