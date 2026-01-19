import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.trainingAttendance.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.event.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.member.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database cleared');
  console.log('🌱 Starting database seed with demo data...\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // 1. CREATE ADMIN & MANAGER USERS
  // ============================================
  console.log('👤 Creating admin and manager users...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clubchamp.com',
      password: hashedPassword,
      firstName: 'Mohamed',
      lastName: 'Dachraoui',
      role: 'Admin',
      phone: '98765432',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@clubchamp.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      role: 'Manager',
      phone: '55123456',
    },
  });

  console.log('  ✅ Admin: admin@clubchamp.com');
  console.log('  ✅ Manager: manager@clubchamp.com');

  // ============================================
  // 2. CREATE COACHES
  // ============================================
  console.log('\n🏋️ Creating coaches...');
  
  const coaches = await Promise.all([
    prisma.user.create({
      data: {
        email: 'coach.karim@clubchamp.com',
        password: hashedPassword,
        firstName: 'Karim',
        lastName: 'Benzema',
        role: 'Coach',
        phone: '22334455',
        sportType: 'Football',
        member: {
          create: {
            address: 'Avenue Habib Bourguiba, Tunis',
            speciality: 'Football',
            baseSalary: 3500,
            strongPoint: 'Tactical Analysis',
            weakPoint: null,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'coach.serena@clubchamp.com',
        password: hashedPassword,
        firstName: 'Serena',
        lastName: 'Williams',
        role: 'Coach',
        phone: '22445566',
        sportType: 'Tennis',
        member: {
          create: {
            address: 'Rue de la Liberté, Sousse',
            speciality: 'Tennis',
            baseSalary: 3200,
            strongPoint: 'Serve Technique',
            weakPoint: null,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'coach.michael@clubchamp.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Jordan',
        role: 'Coach',
        phone: '22556677',
        sportType: 'Basketball',
        member: {
          create: {
            address: 'Avenue Mohamed V, Sfax',
            speciality: 'Basketball',
            baseSalary: 3800,
            strongPoint: 'Offensive Plays',
            weakPoint: null,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'coach.phelps@clubchamp.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Phelps',
        role: 'Coach',
        phone: '22667788',
        sportType: 'Swimming',
        member: {
          create: {
            address: 'Zone Touristique, Hammamet',
            speciality: 'Swimming',
            baseSalary: 3000,
            strongPoint: 'Butterfly Stroke',
            weakPoint: null,
          },
        },
      },
    }),
  ]);

  console.log('  ✅ Created 4 coaches');

  // ============================================
  // 3. CREATE STAFF MEMBERS
  // ============================================
  console.log('\n👷 Creating staff members...');
  
  const staff = await Promise.all([
    prisma.user.create({
      data: {
        email: 'physio@clubchamp.com',
        password: hashedPassword,
        firstName: 'Sami',
        lastName: 'Khedira',
        role: 'Staff',
        phone: '33112233',
        member: {
          create: {
            address: 'Centre Ville, Tunis',
            baseSalary: 1800,
            strongPoint: 'Dept: Medical | Position: Physiotherapist',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'equipment@clubchamp.com',
        password: hashedPassword,
        firstName: 'Nabil',
        lastName: 'Fekir',
        role: 'Staff',
        phone: '33223344',
        member: {
          create: {
            address: 'La Marsa, Tunis',
            baseSalary: 1500,
            strongPoint: 'Dept: Operations | Position: Equipment Manager',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'fitness@clubchamp.com',
        password: hashedPassword,
        firstName: 'Houssem',
        lastName: 'Aouar',
        role: 'Staff',
        phone: '33334455',
        member: {
          create: {
            address: 'Lac 2, Tunis',
            baseSalary: 2000,
            strongPoint: 'Dept: Training | Position: Fitness Coach',
          },
        },
      },
    }),
  ]);

  console.log('  ✅ Created 3 staff members');

  // ============================================
  // 4. CREATE TEAMS
  // ============================================
  console.log('\n⚽ Creating teams...');
  
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Thunder FC',
        discipline: 'Football',
        coachId: coaches[0].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Lightning Tennis',
        discipline: 'Tennis',
        coachId: coaches[1].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Storm Basketball',
        discipline: 'Basketball',
        coachId: coaches[2].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Aqua Sharks',
        discipline: 'Swimming',
        coachId: coaches[3].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Rising Stars U18',
        discipline: 'Football',
        coachId: coaches[0].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Elite Volleyball',
        discipline: 'Volleyball',
        coachId: null,
      },
    }),
  ]);

  console.log('  ✅ Created 6 teams');

  // ============================================
  // 5. CREATE ATHLETES (MEMBERS)
  // ============================================
  console.log('\n🏃 Creating athletes...');
  
  const athleteData = [
    // Football players
    { firstName: 'Yassine', lastName: 'Bounou', email: 'yassine.bounou@email.com', phone: '55001122', speciality: 'Football', team: teams[0], weight: 82, height: 192, dob: '1991-04-05', strong: 'Shot Stopping', weak: 'Distribution', salary: 2500 },
    { firstName: 'Achraf', lastName: 'Hakimi', email: 'achraf.hakimi@email.com', phone: '55002233', speciality: 'Football', team: teams[0], weight: 68, height: 181, dob: '1998-11-04', strong: 'Speed & Crossing', weak: 'Defensive Positioning', salary: 2800 },
    { firstName: 'Riyad', lastName: 'Mahrez', email: 'riyad.mahrez@email.com', phone: '55003344', speciality: 'Football', team: teams[0], weight: 67, height: 179, dob: '1991-02-21', strong: 'Dribbling', weak: 'Physical Duels', salary: 3000 },
    { firstName: 'Sofiane', lastName: 'Boufal', email: 'sofiane.boufal@email.com', phone: '55004455', speciality: 'Football', team: teams[0], weight: 72, height: 174, dob: '1993-09-17', strong: 'Creativity', weak: 'Consistency', salary: 2200 },
    { firstName: 'Ismail', lastName: 'Bennacer', email: 'ismail.bennacer@email.com', phone: '55005566', speciality: 'Football', team: teams[0], weight: 70, height: 175, dob: '1997-12-01', strong: 'Ball Control', weak: 'Aerial Duels', salary: 2600 },
    
    // Tennis players
    { firstName: 'Ons', lastName: 'Jabeur', email: 'ons.jabeur@email.com', phone: '55011122', speciality: 'Tennis', team: teams[1], weight: 66, height: 167, dob: '1994-08-28', strong: 'Drop Shots', weak: 'First Serve %', salary: 2000 },
    { firstName: 'Malek', lastName: 'Jaziri', email: 'malek.jaziri@email.com', phone: '55012233', speciality: 'Tennis', team: teams[1], weight: 77, height: 183, dob: '1984-04-11', strong: 'Baseline Play', weak: 'Net Game', salary: 1800 },
    { firstName: 'Skander', lastName: 'Mansouri', email: 'skander.mansouri@email.com', phone: '55013344', speciality: 'Tennis', team: teams[1], weight: 75, height: 180, dob: '1999-01-15', strong: 'Serve Speed', weak: 'Mental Toughness', salary: 1500 },
    
    // Basketball players
    { firstName: 'Salah', lastName: 'Mejri', email: 'salah.mejri@email.com', phone: '55021122', speciality: 'Basketball', team: teams[2], weight: 111, height: 218, dob: '1986-06-15', strong: 'Blocking', weak: 'Free Throws', salary: 2400 },
    { firstName: 'Makram', lastName: 'Ben Romdhane', email: 'makram.br@email.com', phone: '55022233', speciality: 'Basketball', team: teams[2], weight: 90, height: 196, dob: '1995-03-22', strong: '3-Point Shooting', weak: 'Defense', salary: 2100 },
    { firstName: 'Mourad', lastName: 'El Mabrouk', email: 'mourad.em@email.com', phone: '55023344', speciality: 'Basketball', team: teams[2], weight: 85, height: 188, dob: '1998-07-08', strong: 'Court Vision', weak: 'Stamina', salary: 1900 },
    { firstName: 'Firas', lastName: 'Lahyani', email: 'firas.l@email.com', phone: '55024455', speciality: 'Basketball', team: teams[2], weight: 88, height: 195, dob: '1997-11-30', strong: 'Dunking', weak: 'Ball Handling', salary: 2000 },
    
    // Swimmers
    { firstName: 'Oussama', lastName: 'Mellouli', email: 'oussama.m@email.com', phone: '55031122', speciality: 'Swimming', team: teams[3], weight: 82, height: 187, dob: '1984-06-16', strong: 'Long Distance', weak: 'Sprint Events', salary: 2200 },
    { firstName: 'Ahmed', lastName: 'Hafnaoui', email: 'ahmed.h@email.com', phone: '55032233', speciality: 'Swimming', team: teams[3], weight: 76, height: 185, dob: '2002-10-02', strong: 'Freestyle', weak: 'Backstroke', salary: 2500 },
    { firstName: 'Ayman', lastName: 'Chakroun', email: 'ayman.c@email.com', phone: '55033344', speciality: 'Swimming', team: teams[3], weight: 78, height: 182, dob: '1999-05-18', strong: 'Butterfly', weak: 'Turns', salary: 1800 },
    
    // Youth Football
    { firstName: 'Youssef', lastName: 'Msakni', email: 'youssef.ms@email.com', phone: '55041122', speciality: 'Football', team: teams[4], weight: 65, height: 175, dob: '2006-03-12', strong: 'Technical Skills', weak: 'Physical Strength', salary: 800 },
    { firstName: 'Hamza', lastName: 'Rafia', email: 'hamza.r@email.com', phone: '55042233', speciality: 'Football', team: teams[4], weight: 62, height: 172, dob: '2007-01-28', strong: 'Pace', weak: 'Decision Making', salary: 750 },
    { firstName: 'Bilel', lastName: 'Khefifi', email: 'bilel.k@email.com', phone: '55043344', speciality: 'Football', team: teams[4], weight: 68, height: 178, dob: '2006-08-05', strong: 'Shooting', weak: 'Weak Foot', salary: 850 },
    
    // Volleyball
    { firstName: 'Mehdi', lastName: 'Ben Cheikh', email: 'mehdi.bc@email.com', phone: '55051122', speciality: 'Volleyball', team: teams[5], weight: 88, height: 198, dob: '1995-09-20', strong: 'Spiking', weak: 'Reception', salary: 1600 },
    { firstName: 'Nizar', lastName: 'Tlili', email: 'nizar.t@email.com', phone: '55052233', speciality: 'Volleyball', team: teams[5], weight: 85, height: 195, dob: '1997-04-14', strong: 'Blocking', weak: 'Serving', salary: 1500 },
    
    // Additional diverse athletes
    { firstName: 'Sabrine', lastName: 'Khalfallah', email: 'sabrine.k@email.com', phone: '55061122', speciality: 'Athletics', team: null, weight: 55, height: 165, dob: '1998-12-03', strong: '400m Sprint', weak: 'Long Distance', salary: 1200 },
    { firstName: 'Habiba', lastName: 'Ghribi', email: 'habiba.g@email.com', phone: '55062233', speciality: 'Athletics', team: null, weight: 52, height: 168, dob: '1984-04-09', strong: 'Steeplechase', weak: 'Sprint Events', salary: 1400 },
    { firstName: 'Ines', lastName: 'Boubakri', email: 'ines.b@email.com', phone: '55063344', speciality: 'MartialArts', team: null, weight: 58, height: 162, dob: '1989-10-25', strong: 'Footwork', weak: 'Power', salary: 1300 },
    { firstName: 'Sarra', lastName: 'Besbes', email: 'sarra.b@email.com', phone: '55064455', speciality: 'MartialArts', team: null, weight: 55, height: 160, dob: '1989-08-20', strong: 'Speed', weak: 'Defense', salary: 1250 },
    { firstName: 'Marwa', lastName: 'Amri', email: 'marwa.a@email.com', phone: '55065566', speciality: 'Wrestling', team: null, weight: 53, height: 158, dob: '1989-01-24', strong: 'Technique', weak: 'Endurance', salary: 1350 },
  ];

  const athletes = [];
  for (const data of athleteData) {
    const athlete = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'Athlete',
        phone: data.phone,
        sportType: data.speciality,
        member: {
          create: {
            address: 'Tunis, Tunisia',
            emergencyContact: '71' + Math.floor(100000 + Math.random() * 900000),
            dateOfBirth: new Date(data.dob),
            speciality: data.speciality,
            weight: data.weight,
            height: data.height,
            strongPoint: data.strong,
            weakPoint: data.weak,
            baseSalary: data.salary,
            teamId: data.team?.id || null,
          },
        },
        subscriptions: {
          create: {
            type: Math.random() > 0.3 ? 'Premium' : (Math.random() > 0.5 ? 'Elite' : 'Basic'),
            status: Math.random() > 0.15 ? 'Active' : (Math.random() > 0.5 ? 'Pending' : 'Inactive'),
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-01-01'),
            price: Math.random() > 0.5 ? 150 : (Math.random() > 0.5 ? 250 : 75),
            autoRenewal: Math.random() > 0.3,
          },
        },
      },
    });
    athletes.push(athlete);
  }

  console.log(`  ✅ Created ${athletes.length} athletes`);

  // ============================================
  // 6. CREATE TRAINING SESSIONS
  // ============================================
  console.log('\n📅 Creating training sessions...');
  
  const trainingSessions = [];
  const trainingData = [
    { title: 'Football Tactical Training', discipline: 'Football', coach: coaches[0], location: 'Main Stadium', capacity: 25 },
    { title: 'Tennis Serve Practice', discipline: 'Tennis', coach: coaches[1], location: 'Tennis Court A', capacity: 8 },
    { title: 'Basketball Offense Drills', discipline: 'Basketball', coach: coaches[2], location: 'Indoor Arena', capacity: 15 },
    { title: 'Swimming Endurance Session', discipline: 'Swimming', coach: coaches[3], location: 'Olympic Pool', capacity: 20 },
    { title: 'Youth Football Skills', discipline: 'Football', coach: coaches[0], location: 'Training Ground B', capacity: 20 },
    { title: 'Tennis Footwork Drills', discipline: 'Tennis', coach: coaches[1], location: 'Tennis Court B', capacity: 6 },
    { title: 'Basketball Defense Workshop', discipline: 'Basketball', coach: coaches[2], location: 'Indoor Arena', capacity: 15 },
    { title: 'Swimming Sprint Training', discipline: 'Swimming', coach: coaches[3], location: 'Training Pool', capacity: 12 },
  ];

  // Create past, current, and future training sessions
  for (let i = 0; i < 24; i++) {
    const dayOffset = i - 12; // -12 to +11 days from today
    const data = trainingData[i % trainingData.length];
    const session = await prisma.trainingSession.create({
      data: {
        title: data.title,
        date: new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000),
        time: ['08:00', '10:00', '14:00', '16:00', '18:00'][Math.floor(Math.random() * 5)],
        duration: ['1 hour', '1.5 hours', '2 hours'][Math.floor(Math.random() * 3)],
        discipline: data.discipline,
        coachId: data.coach.id,
        location: data.location,
        maxCapacity: data.capacity,
        status: dayOffset < -2 ? 'Completed' : (dayOffset < 0 ? (Math.random() > 0.2 ? 'Completed' : 'Cancelled') : 'Scheduled'),
        notes: dayOffset < 0 ? 'Session completed successfully' : null,
      },
    });
    trainingSessions.push(session);
  }

  console.log(`  ✅ Created ${trainingSessions.length} training sessions`);

  // ============================================
  // 7. CREATE EVENTS
  // ============================================
  console.log('\n🏆 Creating events...');
  
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Annual Club Championship',
        description: 'The biggest tournament of the year featuring all sports disciplines. Athletes will compete for the championship title.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        time: '09:00',
        type: 'Tournament',
        location: 'Club Main Complex',
        capacity: 200,
        status: 'Upcoming',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Football League Match vs Rivals FC',
        description: 'Important league match against our local rivals. All supporters welcome!',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '15:00',
        type: 'Competition',
        location: 'Main Stadium',
        capacity: 150,
        status: 'Upcoming',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Swimming Technique Workshop',
        description: 'Professional workshop on advanced swimming techniques led by Olympic coach.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '10:00',
        type: 'Workshop',
        location: 'Olympic Pool',
        capacity: 30,
        status: 'Upcoming',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Club Social Night',
        description: 'Annual social gathering for all club members, coaches, and staff. Food and entertainment provided.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        time: '19:00',
        type: 'Social',
        location: 'Club House',
        capacity: 100,
        status: 'Upcoming',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Basketball 3v3 Tournament',
        description: 'Exciting 3v3 basketball tournament open to all members.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        time: '14:00',
        type: 'Tournament',
        location: 'Indoor Arena',
        capacity: 48,
        status: 'Completed',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Tennis Open Day',
        description: 'Open day for tennis enthusiasts. Free coaching sessions and equipment provided.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        time: '09:00',
        type: 'Social',
        location: 'Tennis Courts',
        capacity: 40,
        status: 'Completed',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Youth Football Camp',
        description: 'Week-long intensive training camp for U18 players.',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        time: '08:00',
        type: 'Workshop',
        location: 'Training Ground',
        capacity: 50,
        status: 'Upcoming',
      },
    }),
    prisma.event.create({
      data: {
        title: 'Regional Swimming Competition',
        description: 'Regional championship featuring top swimmers from across the region.',
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        time: '08:00',
        type: 'Competition',
        location: 'Olympic Pool',
        capacity: 80,
        status: 'Upcoming',
      },
    }),
  ]);

  console.log(`  ✅ Created ${events.length} events`);

  // ============================================
  // 8. CREATE PAYMENTS
  // ============================================
  console.log('\n💳 Creating payments...');
  
  const payments = [];
  for (const athlete of athletes) {
    // Create 1-3 payments per athlete
    const numPayments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPayments; i++) {
      const payment = await prisma.payment.create({
        data: {
          memberId: athlete.id,
          amount: [75, 150, 250, 50, 100][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
          status: ['Paid', 'Paid', 'Paid', 'Pending', 'Overdue'][Math.floor(Math.random() * 5)],
          type: ['Membership', 'Training', 'Event', 'Equipment'][Math.floor(Math.random() * 4)],
          method: ['Card', 'Cash', 'BankTransfer'][Math.floor(Math.random() * 3)],
        },
      });
      payments.push(payment);
    }
  }

  console.log(`  ✅ Created ${payments.length} payments`);

  // ============================================
  // 9. CREATE SALARIES
  // ============================================
  console.log('\n💰 Creating salary records...');
  
  const allStaffAndCoaches = [...coaches, ...staff, ...athletes.slice(0, 15)]; // Some athletes have salaries
  const salaries = [];
  
  for (const person of allStaffAndCoaches) {
    // Create salaries for last 3 months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - monthOffset);
      monthDate.setDate(1);
      
      const member = await prisma.member.findUnique({ where: { userId: person.id } });
      const baseSalary = member?.baseSalary || 1500;
      
      const salaryType = person.role === 'Coach' ? 'Coach' : (person.role === 'Staff' ? 'Staff' : 'Player');
      
      try {
        const salary = await prisma.salary.create({
          data: {
            userId: person.id,
            amount: baseSalary,
            month: monthDate,
            type: salaryType,
            status: monthOffset > 0 ? 'Paid' : (Math.random() > 0.3 ? 'Pending' : 'Paid'),
            paidDate: monthOffset > 0 ? new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 5) : null,
            bonus: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
            deductions: Math.random() > 0.8 ? Math.floor(Math.random() * 200) : 0,
            notes: monthOffset === 0 ? 'Current month' : null,
          },
        });
        salaries.push(salary);
      } catch (e) {
        // Skip if salary already exists for this month
      }
    }
  }

  console.log(`  ✅ Created ${salaries.length} salary records`);

  // ============================================
  // 10. CREATE EXPENSES
  // ============================================
  console.log('\n📊 Creating expenses...');
  
  const expenseCategories = [
    { category: 'Equipment', items: ['Football balls (50)', 'Tennis rackets', 'Swimming goggles', 'Basketball hoops maintenance', 'Training cones and markers'] },
    { category: 'Facilities', items: ['Stadium lighting repair', 'Pool cleaning service', 'Gym equipment maintenance', 'Air conditioning service', 'Parking lot repairs'] },
    { category: 'Utilities', items: ['Electricity bill', 'Water bill', 'Internet service', 'Phone service', 'Gas bill'] },
    { category: 'Marketing', items: ['Social media ads', 'Event banners', 'Club merchandise', 'Website maintenance', 'Photography services'] },
    { category: 'Transportation', items: ['Team bus fuel', 'Away game travel', 'Equipment transport', 'Staff transportation', 'Competition travel'] },
    { category: 'Medical', items: ['First aid supplies', 'Physiotherapy equipment', 'Medical checkups', 'Insurance premiums', 'Injury treatment'] },
  ];

  const expenses = [];
  for (let i = 0; i < 30; i++) {
    const catData = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const expense = await prisma.expense.create({
      data: {
        description: catData.items[Math.floor(Math.random() * catData.items.length)],
        amount: Math.floor(Math.random() * 2000) + 100,
        date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        category: catData.category,
      },
    });
    expenses.push(expense);
  }

  console.log(`  ✅ Created ${expenses.length} expenses`);

  // ============================================
  // 11. CREATE SPONSORS
  // ============================================
  console.log('\n🤝 Creating sponsors...');
  
  const sponsors = await Promise.all([
    prisma.sponsor.create({
      data: {
        name: 'Tunisie Telecom',
        amount: 50000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'Active',
        tier: 'Gold',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Banque de Tunisie',
        amount: 35000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'Active',
        tier: 'Gold',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Ooredoo Tunisia',
        amount: 25000,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-03-01'),
        status: 'Active',
        tier: 'Silver',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'UBCI Bank',
        amount: 20000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'Active',
        tier: 'Silver',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Délice Danone',
        amount: 15000,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-06-01'),
        status: 'Pending',
        tier: 'Silver',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Poulina Group',
        amount: 10000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'Active',
        tier: 'Bronze',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Monoprix Tunisia',
        amount: 8000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-02-01'),
        status: 'Active',
        tier: 'Bronze',
      },
    }),
    prisma.sponsor.create({
      data: {
        name: 'Carrefour Tunisia',
        amount: 12000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'Expired',
        tier: 'Bronze',
      },
    }),
  ]);

  console.log(`  ✅ Created ${sponsors.length} sponsors`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   👤 Admin/Manager: 2`);
  console.log(`   🏋️ Coaches: ${coaches.length}`);
  console.log(`   👷 Staff: ${staff.length}`);
  console.log(`   🏃 Athletes: ${athletes.length}`);
  console.log(`   ⚽ Teams: ${teams.length}`);
  console.log(`   📅 Training Sessions: ${trainingSessions.length}`);
  console.log(`   🏆 Events: ${events.length}`);
  console.log(`   💳 Payments: ${payments.length}`);
  console.log(`   💰 Salaries: ${salaries.length}`);
  console.log(`   📊 Expenses: ${expenses.length}`);
  console.log(`   🤝 Sponsors: ${sponsors.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin: admin@clubchamp.com / password123');
  console.log('   Manager: manager@clubchamp.com / password123');
  console.log('   All other accounts use password: password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

