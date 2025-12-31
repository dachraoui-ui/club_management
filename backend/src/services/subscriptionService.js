import prisma from '../config/database.js';

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = async (query) => {
  const {
    page = 1,
    limit = 10,
    userId,
    status,
    type,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(userId && { userId }),
    ...(status && { status }),
    ...(type && { type }),
  };

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    subscriptions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (id) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return subscription;
};

/**
 * Create subscription
 */
export const createSubscription = async (subscriptionData) => {
  const subscription = await prisma.subscription.create({
    data: subscriptionData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return subscription;
};

/**
 * Update subscription
 */
export const updateSubscription = async (id, subscriptionData) => {
  const subscription = await prisma.subscription.update({
    where: { id },
    data: subscriptionData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return subscription;
};

/**
 * Renew subscription
 */
export const renewSubscription = async (id) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  const newStartDate = new Date();
  const newEndDate = new Date();
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  const renewed = await prisma.subscription.update({
    where: { id },
    data: {
      startDate: newStartDate,
      endDate: newEndDate,
      status: 'Active',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return renewed;
};

