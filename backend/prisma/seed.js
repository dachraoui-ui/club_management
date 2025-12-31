import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportclub.com' },
    update: {},
    create: {
      email: 'admin@sportclub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'Admin',
      phone: '+1 234 567 8900',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample coach
  const coachPassword = await bcrypt.hash('coach123', 10);
  const coach = await prisma.user.upsert({
    where: { email: 'coach.martinez@sportclub.com' },
    update: {},
    create: {
      email: 'coach.martinez@sportclub.com',
      password: coachPassword,
      firstName: 'Coach',
      lastName: 'Martinez',
      role: 'Coach',
      phone: '+1 234 567 8901',
      sportType: 'Football',
    },
  });

  console.log('✅ Coach created:', coach.email);

  // Create sample members
  const memberData = [
    {
      email: 'john.smith@email.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1 234 567 8901',
      role: 'Athlete',
      sportType: 'Football',
      member: {
        address: '123 Main St, City',
        emergencyContact: '+1 234 567 8902',
        dateOfBirth: new Date('1990-05-15'),
        sports: ['Football', 'Basketball'],
      },
      subscriptions: {
        create: {
          type: 'Premium',
          status: 'Active',
          startDate: new Date('2023-01-15'),
          endDate: new Date('2024-01-15'),
          price: 150,
          autoRenewal: true,
        },
      },
    },
    {
      email: 'sarah.j@email.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1 234 567 8903',
      role: 'Athlete',
      sportType: 'Tennis',
      member: {
        address: '456 Oak Ave, Town',
        emergencyContact: '+1 234 567 8904',
        dateOfBirth: new Date('1995-08-22'),
        sports: ['Tennis', 'Swimming'],
      },
      subscriptions: {
        create: {
          type: 'Elite',
          status: 'Active',
          startDate: new Date('2022-06-10'),
          endDate: new Date('2024-06-10'),
          price: 250,
          autoRenewal: true,
        },
      },
    },
  ];

  for (const member of memberData) {
    const password = await bcrypt.hash('member123', 10);
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        ...member,
        password,
        member: {
          create: member.member,
        },
        subscriptions: member.subscriptions,
      },
    });
    console.log(`✅ Member created: ${user.email}`);
  }

  // Create sample team
  const team = await prisma.team.create({
    data: {
      name: 'Thunder FC',
      discipline: 'Football',
      coachId: coach.id,
    },
  });

  console.log('✅ Team created:', team.name);

  // Create sample training session
  const training = await prisma.trainingSession.create({
    data: {
      title: 'Football Practice',
      date: new Date('2024-02-10'),
      time: '09:00',
      duration: '2 hours',
      discipline: 'Football',
      coachId: coach.id,
      location: 'Main Field',
      maxCapacity: 25,
      status: 'Scheduled',
    },
  });

  console.log('✅ Training session created:', training.title);

  // Create sample event
  const event = await prisma.event.create({
    data: {
      title: 'Annual Sports Day',
      description: 'Our biggest event of the year featuring competitions across all sports.',
      date: new Date('2024-03-15'),
      time: '08:00',
      type: 'Tournament',
      location: 'Main Sports Complex',
      capacity: 500,
      status: 'Upcoming',
    },
  });

  console.log('✅ Event created:', event.title);

  // Create sample payment
  const members = await prisma.user.findMany({
    where: { role: 'Athlete' },
    include: { member: true },
  });

  if (members.length > 0) {
    const payment = await prisma.payment.create({
      data: {
        memberId: members[0].id,
        amount: 150,
        status: 'Paid',
        type: 'Membership',
        method: 'Card',
      },
    });

    console.log('✅ Payment created:', payment.id);
  }

  // Create sample sponsor
  const sponsor = await prisma.sponsor.create({
    data: {
      name: 'SportTech Inc.',
      amount: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'Active',
      tier: 'Gold',
    },
  });

  console.log('✅ Sponsor created:', sponsor.name);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

