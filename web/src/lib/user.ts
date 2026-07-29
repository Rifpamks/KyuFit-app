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

