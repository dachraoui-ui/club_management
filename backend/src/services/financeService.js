import prisma from '../config/database.js';

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

