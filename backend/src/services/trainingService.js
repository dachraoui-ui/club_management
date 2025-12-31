import prisma from '../config/database.js';

/**
 * Get all training sessions
 */
export const getAllTrainings = async (query) => {
  const {
    status,
    dateFrom,
    dateTo,
    coachId,
  } = query;

  const where = {
    ...(status && { status }),
    ...(coachId && { coachId }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  };

  const trainings = await prisma.trainingSession.findMany({
    where,
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      attendance: {
        include: {
          athlete: {
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

  // Add attendee count
  const trainingsWithStats = trainings.map((training) => ({
    ...training,
    attendees: training.attendance.length,
  }));

  return trainingsWithStats;
};

/**
 * Get training by ID
 */
export const getTrainingById = async (id) => {
  const training = await prisma.trainingSession.findUnique({
    where: { id },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      attendance: {
        include: {
          athlete: {
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

  if (!training) {
    throw new Error('Training session not found');
  }

  return {
    ...training,
    attendees: training.attendance.length,
  };
};

/**
 * Create training session
 */
export const createTraining = async (trainingData) => {
  const training = await prisma.trainingSession.create({
    data: {
      ...trainingData,
      date: new Date(trainingData.date),
    },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      attendance: true,
    },
  });

  return training;
};

/**
 * Update training session
 */
export const updateTraining = async (id, trainingData) => {
  const data = {
    ...trainingData,
    ...(trainingData.date && { date: new Date(trainingData.date) }),
  };

  const training = await prisma.trainingSession.update({
    where: { id },
    data,
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      attendance: {
        include: {
          athlete: {
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

  return training;
};

/**
 * Delete training session
 */
export const deleteTraining = async (id) => {
  await prisma.trainingSession.delete({
    where: { id },
  });

  return { message: 'Training session deleted successfully' };
};

/**
 * Mark attendance
 */
export const markAttendance = async (trainingId, attendanceData) => {
  const attendance = await prisma.trainingAttendance.create({
    data: {
      trainingId,
      ...attendanceData,
    },
    include: {
      athlete: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      training: {
        select: {
          id: true,
          title: true,
          date: true,
        },
      },
    },
  });

  return attendance;
};

/**
 * Get attendance list
 */
export const getAttendance = async (trainingId) => {
  const attendance = await prisma.trainingAttendance.findMany({
    where: { trainingId },
    include: {
      athlete: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return attendance;
};

