import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const roles = ['Administrateur', 'Intervenants', 'Spectateur'];

const pricingModes = [
  'Heure',
  'Demi-journee',
  'Journee',
  'Forfait',
  'Libre',
];

const statuses = [
  'Planifiée',
  'Réalisée',
  'Déclarée',
  'Facturée',
  'Réglée',
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function seedByName(
  model: { findFirst: Function; create: Function },
  names: string[],
) {
  for (const name of names) {
    try {
      const existing = await model.findFirst({ where: { name } });
      if (!existing) {
        await model.create({ data: { name } });
      }
    } catch (error) {
      throw new Error(`Failed to seed "${name}"`, { cause: error });
    }
  }
}

async function main() {
  await seedByName(prisma.role, roles);
  await seedByName(prisma.pricingMode, pricingModes);
  await seedByName(prisma.status, statuses);

  const [roleCount, pricingModeCount, statusCount] = await Promise.all([
    prisma.role.count(),
    prisma.pricingMode.count(),
    prisma.status.count(),
  ]);

  console.log('Seed completed:');
  console.log(`  Roles: ${roleCount}`);
  console.log(`  Pricing modes: ${pricingModeCount}`);
  console.log(`  Statuses: ${statusCount}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
