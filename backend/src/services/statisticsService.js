import prisma from '../config/database.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Total members
  const totalMembers = await prisma.member.count();

  // Active teams
  const activeTeams = await prisma.team.count();

  // Upcoming trainings (next 30 days)
  const upcomingTrainings = await prisma.trainingSession.count({
    where: {
      date: {
        gte: now,
        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      status: 'Scheduled',
    },
  });

  // Events this month
  const eventsThisMonth = await prisma.event.count({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Monthly revenue (paid payments this month)
  const monthlyRevenue = await prisma.payment.aggregate({
    where: {
      status: 'Paid',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Member growth (last month vs this month)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const membersLastMonth = await prisma.member.count({
    where: {
      joinDate: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  const membersThisMonth = await prisma.member.count({
    where: {
      joinDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const memberGrowth = membersLastMonth > 0
    ? ((membersThisMonth - membersLastMonth) / membersLastMonth) * 100
    : 0;

  // Revenue growth
  const lastMonthRevenue = await prisma.payment.aggregate({
    where: {
      status: 'Paid',
      date: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const revenueGrowth = lastMonthRevenue._sum.amount > 0
    ? ((monthlyRevenue._sum.amount - lastMonthRevenue._sum.amount) / lastMonthRevenue._sum.amount) * 100
    : 0;

  return {
    totalMembers,
    activeTeams,
    upcomingTrainings,
    eventsThisMonth,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    memberGrowth: parseFloat(memberGrowth.toFixed(1)),
    revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
  };
};

/**
 * Get athlete statistics
 */
export const getAthleteStats = async () => {
  // Calculate average attendance rate
  const totalTrainings = await prisma.trainingSession.count({
    where: {
      status: 'Completed',
    },
  });

  const totalAttendance = await prisma.trainingAttendance.count({
    where: {
      status: 'Present',
    },
  });

  const attendanceRate = totalTrainings > 0
    ? (totalAttendance / (totalTrainings * 10)) * 100 // Assuming avg 10 athletes per training
    : 0;

  return {
    attendanceRate: parseFloat(attendanceRate.toFixed(1)),
    totalTrainings,
    totalAttendance,
  };
};

/**
 * Get financial statistics
 */
export const getFinanceStats = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // Revenue by month (last 6 months)
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const revenue = await prisma.payment.aggregate({
      where: {
        status: 'Paid',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await prisma.expense.aggregate({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    revenueData.push({
      month: monthStart.toLocaleString('default', { month: 'short' }),
      revenue: revenue._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
    });
  }

  // Payment status breakdown
  const paymentStatusBreakdown = await prisma.payment.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  return {
    revenueData,
    paymentStatusBreakdown: paymentStatusBreakdown.map((item) => ({
      status: item.status,
      count: item._count.id,
    })),
  };
};

/**
 * Get membership distribution
 */
export const getMembershipDistribution = async () => {
  const distribution = await prisma.subscription.groupBy({
    by: ['type'],
    _count: {
      id: true,
    },
  });

  return distribution.map((item) => ({
    name: item.type,
    value: item._count.id,
  }));
};

/**
 * Get sports participation distribution
 */
export const getSportsDistribution = async () => {
  const members = await prisma.member.findMany({
    select: {
      sports: true,
    },
  });

  const sportCounts = {};
  members.forEach((member) => {
    member.sports.forEach((sport) => {
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
    });
  });

  return Object.entries(sportCounts).map(([sport, members]) => ({
    sport,
    members,
  }));
};

