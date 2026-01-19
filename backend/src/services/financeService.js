import prisma from '../config/database.js';

/**
 * Get finance dashboard stats
 */
export const getFinanceStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get payment stats
  const [
    totalRevenue,
    pendingPayments,
    overduePayments,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'Paid' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'Pending' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'Overdue' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'Paid',
        date: { gte: startOfMonth },
      },
    }),
  ]);

  // Get salary stats
  const [
    totalSalaries,
    pendingSalaries,
    paidSalariesThisMonth,
  ] = await Promise.all([
    prisma.salary.aggregate({
      _sum: { amount: true },
      where: { status: 'Paid' },
    }),
    prisma.salary.aggregate({
      _sum: { amount: true },
      where: { status: 'Pending' },
    }),
    prisma.salary.aggregate({
      _sum: { amount: true },
      where: {
        status: 'Paid',
        paidDate: { gte: startOfMonth },
      },
    }),
  ]);

  // Get expense stats
  const [
    totalExpenses,
    monthlyExpenses,
  ] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        date: { gte: startOfMonth },
      },
    }),
  ]);

  // Get sponsor stats
  const [
    activeSponsors,
    totalSponsorship,
  ] = await Promise.all([
    prisma.sponsor.count({
      where: { status: 'Active' },
    }),
    prisma.sponsor.aggregate({
      _sum: { amount: true },
      where: { status: 'Active' },
    }),
  ]);

  // Get monthly data for charts (last 12 months)
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const [revenue, expenses, salaries] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Paid',
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.salary.aggregate({
        _sum: { amount: true },
        where: {
          status: 'Paid',
          month: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    monthlyData.push({
      month: monthStart.toLocaleString('default', { month: 'short' }),
      revenue: revenue._sum.amount || 0,
      expenses: (expenses._sum.amount || 0) + (salaries._sum.amount || 0),
      salaries: salaries._sum.amount || 0,
    });
  }

  return {
    revenue: {
      total: totalRevenue._sum.amount || 0,
      monthly: monthlyRevenue._sum.amount || 0,
      pending: pendingPayments._sum.amount || 0,
      overdue: overduePayments._sum.amount || 0,
    },
    salaries: {
      total: totalSalaries._sum.amount || 0,
      pending: pendingSalaries._sum.amount || 0,
      monthlyPaid: paidSalariesThisMonth._sum.amount || 0,
    },
    expenses: {
      total: totalExpenses._sum.amount || 0,
      monthly: monthlyExpenses._sum.amount || 0,
    },
    sponsorships: {
      activeCount: activeSponsors,
      totalAmount: totalSponsorship._sum.amount || 0,
    },
    monthlyData,
  };
};

/**
 * Get all payments
 */
export const getAllPayments = async (query) => {
  const {
    page = 1,
    limit = 10,
    memberId,
    status,
    type,
    dateFrom,
    dateTo,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(memberId && { memberId }),
    ...(status && { status }),
    ...(type && { type }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Create payment
 */
export const createPayment = async (paymentData) => {
  const payment = await prisma.payment.create({
    data: {
      ...paymentData,
      date: paymentData.date ? new Date(paymentData.date) : new Date(),
    },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Update payment
 */
export const updatePayment = async (id, paymentData) => {
  const data = {
    ...paymentData,
    ...(paymentData.date && { date: new Date(paymentData.date) }),
  };

  const payment = await prisma.payment.update({
    where: { id },
    data,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Delete payment
 */
export const deletePayment = async (id) => {
  await prisma.payment.delete({
    where: { id },
  });
};

/**
 * Get all salaries
 */
export const getAllSalaries = async (query) => {
  const {
    page = 1,
    limit = 10,
    userId,
    type,
    status,
    month,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(userId && { userId }),
    ...(type && { type }),
    ...(status && { status }),
    ...(month && {
      month: {
        gte: new Date(new Date(month).getFullYear(), new Date(month).getMonth(), 1),
        lt: new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 1),
      },
    }),
  };

  const [salaries, total] = await Promise.all([
    prisma.salary.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { month: 'desc' },
    }),
    prisma.salary.count({ where }),
  ]);

  return {
    salaries,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Create salary
 */
export const createSalary = async (salaryData) => {
  const { updateMemberSalary, ...data } = salaryData;
  const monthDate = new Date(data.month);
  
  // Use upsert to handle existing salary for same user/month
  const salary = await prisma.salary.upsert({
    where: {
      userId_month: {
        userId: data.userId,
        month: monthDate,
      },
    },
    update: {
      amount: data.amount,
      type: data.type,
      status: data.status,
      bonus: data.bonus || 0,
      deductions: data.deductions || 0,
      notes: data.notes,
      paidDate: data.status === 'Paid' ? new Date() : null,
    },
    create: {
      ...data,
      month: monthDate,
      paidDate: data.status === 'Paid' ? new Date() : null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // If updateMemberSalary is true, update the member's baseSalary
  if (updateMemberSalary && data.amount) {
    await prisma.member.updateMany({
      where: { userId: data.userId },
      data: { baseSalary: parseFloat(data.amount) },
    });
  }

  return salary;
};

/**
 * Update salary
 */
export const updateSalary = async (id, salaryData) => {
  const { updateMemberSalary, ...dataWithoutFlag } = salaryData;
  
  const data = {
    ...dataWithoutFlag,
    ...(dataWithoutFlag.month && { month: new Date(dataWithoutFlag.month) }),
    ...(dataWithoutFlag.status === 'Paid' && !dataWithoutFlag.paidDate && { paidDate: new Date() }),
  };

  const salary = await prisma.salary.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // If updateMemberSalary is true, update the member's baseSalary
  if (updateMemberSalary && dataWithoutFlag.amount) {
    await prisma.member.updateMany({
      where: { userId: salary.userId },
      data: { baseSalary: parseFloat(dataWithoutFlag.amount) },
    });
  }

  return salary;
};

/**
 * Delete salary
 */
export const deleteSalary = async (id) => {
  await prisma.salary.delete({
    where: { id },
  });
};

/**
 * Get all expenses
 */
export const getAllExpenses = async (query) => {
  const {
    page = 1,
    limit = 10,
    category,
    dateFrom,
    dateTo,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(category && { category }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Create expense
 */
export const createExpense = async (expenseData) => {
  const expense = await prisma.expense.create({
    data: {
      ...expenseData,
      date: expenseData.date ? new Date(expenseData.date) : new Date(),
    },
  });

  return expense;
};

/**
 * Update expense
 */
export const updateExpense = async (id, expenseData) => {
  const data = {
    ...expenseData,
    ...(expenseData.date && { date: new Date(expenseData.date) }),
  };

  const expense = await prisma.expense.update({
    where: { id },
    data,
  });

  return expense;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  await prisma.expense.delete({
    where: { id },
  });
};

/**
 * Get all sponsors
 */
export const getAllSponsors = async (query) => {
  const {
    status,
    tier,
  } = query;

  const where = {
    ...(status && { status }),
    ...(tier && { tier }),
  };

  const sponsors = await prisma.sponsor.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return sponsors;
};

/**
 * Create sponsor
 */
export const createSponsor = async (sponsorData) => {
  const sponsor = await prisma.sponsor.create({
    data: {
      ...sponsorData,
      startDate: new Date(sponsorData.startDate),
      endDate: new Date(sponsorData.endDate),
    },
  });

  return sponsor;
};

/**
 * Update sponsor
 */
export const updateSponsor = async (id, sponsorData) => {
  const data = {
    ...sponsorData,
    ...(sponsorData.startDate && { startDate: new Date(sponsorData.startDate) }),
    ...(sponsorData.endDate && { endDate: new Date(sponsorData.endDate) }),
  };

  const sponsor = await prisma.sponsor.update({
    where: { id },
    data,
  });

  return sponsor;
};

/**
 * Delete sponsor
 */
export const deleteSponsor = async (id) => {
  await prisma.sponsor.delete({
    where: { id },
  });
};