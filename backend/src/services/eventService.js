import prisma from '../config/database.js';

/**
 * Get all events
 */
export const getAllEvents = async (query) => {
  const {
    type,
    status,
    dateFrom,
    dateTo,
  } = query;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  };

  const events = await prisma.event.findMany({
    where,
    include: {
      participants: {
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
      },
    },
    orderBy: { date: 'desc' },
  });

  // Add registered count
  const eventsWithStats = events.map((event) => ({
    ...event,
    registered: event.participants.length,
  }));

  return eventsWithStats;
};

/**
 * Get event by ID
 */
export const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      participants: {
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
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  return {
    ...event,
    registered: event.participants.length,
  };
};

/**
 * Create event
 */
export const createEvent = async (eventData) => {
  const event = await prisma.event.create({
    data: {
      ...eventData,
      date: new Date(eventData.date),
    },
    include: {
      participants: true,
    },
  });

  return event;
};

/**
 * Update event
 */
export const updateEvent = async (id, eventData) => {
  const data = {
    ...eventData,
    ...(eventData.date && { date: new Date(eventData.date) }),
  };

  const event = await prisma.event.update({
    where: { id },
    data,
    include: {
      participants: {
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
      },
    },
  });

  return event;
};

/**
 * Delete event
 */
export const deleteEvent = async (id) => {
  await prisma.event.delete({
    where: { id },
  });

  return { message: 'Event deleted successfully' };
};

/**
 * Register for event
 */
export const registerForEvent = async (eventId, userId) => {
  // Check if event exists and has capacity
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      participants: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.participants.length >= event.capacity) {
    throw new Error('Event is at full capacity');
  }

  // Check if already registered
  const existingParticipant = event.participants.find((p) => p.userId === userId);
  if (existingParticipant) {
    throw new Error('Already registered for this event');
  }

  const participant = await prisma.eventParticipant.create({
    data: {
      eventId,
      userId,
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
      event: {
        select: {
          id: true,
          title: true,
          date: true,
        },
      },
    },
  });

  return participant;
};

/**
 * Unregister from event
 */
export const unregisterFromEvent = async (eventId, userId) => {
  await prisma.eventParticipant.delete({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  return { message: 'Unregistered from event successfully' };
};

/**
 * Update participant result
 */
export const updateParticipantResult = async (eventId, userId, result) => {
  const participant = await prisma.eventParticipant.update({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
    data: { result },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return participant;
};

