import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

const leads = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@nexus-tech.io',
    phone: '+91 98201 44521',
    status: LeadStatus.WON,
  },
  {
    name: 'Marcus Vance',
    email: 'm.vance@vanguardpartners.com',
    phone: '+1 415-890-2134',
    status: LeadStatus.QUALIFIED,
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@designcraft.co',
    phone: '+44 20 7946 0912',
    status: LeadStatus.CONTACTED,
  },
  {
    name: 'Devon Miller',
    email: 'devon.miller@scaleops.dev',
    phone: '+1 650-513-8820',
    status: LeadStatus.NEW,
  },
  {
    name: 'José Müller',
    email: 'jose.muller@finbridge.de',
    phone: '+49 89 2444 7890',
    status: LeadStatus.QUALIFIED,
  },
  {
    name: 'Aarav Mehta',
    email: 'aarav@solardrive.in',
    phone: '+91 91234 56780',
    status: LeadStatus.CONTACTED,
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@biopulse.org',
    phone: '+1 206-555-0147',
    status: LeadStatus.LOST,
  },
];

async function main() {
  console.log('Seeding initial leads into database...');
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: lead,
      create: lead,
    });
  }
  console.log(`Successfully seeded ${leads.length} realistic pipeline leads!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
