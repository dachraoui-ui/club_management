import prisma from '../config/database.js';

/**
 * Get all teams
 */
export const getAllTeams = async (query) => {
  const { search = '' } = query;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { discipline: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const teams = await prisma.team.findMany({
    where,
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      members: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate member count and stats - include coach as a member if assigned
  const teamsWithStats = teams.map((team) => {
    // If no coach is assigned, just return members as-is
    if (!team.coachId || !team.coach) {
      return {
        ...team,
        memberCount: team.members.length,
      };
    }

    const coachAlreadyMember = team.members.some((member) => member.userId === team.coachId);

    const membersWithCoach = coachAlreadyMember
      ? team.members
      : [
          ...team.members,
          {
            id: `coach-${team.id}`,
            teamId: team.id,
            userId: team.coachId,
            joinedAt: team.createdAt,
            user: team.coach,
          },
        ];

    return {
      ...team,
      members: membersWithCoach,
      memberCount: membersWithCoach.length,
    };
  });

  return teamsWithStats;
};

/**
 * Get team by ID
 */
export const getTeamById = async (id) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      members: {
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
      },
    },
  });

  if (!team) {
    throw new Error('Team not found');
  }

  // If no coach is assigned, just return team as-is
  if (!team.coachId || !team.coach) {
    return {
      ...team,
      memberCount: team.members.length,
    };
  }

  // Include coach as a member if not already included
  const coachAlreadyMember = team.members.some((member) => member.userId === team.coachId);

  const membersWithCoach = coachAlreadyMember
    ? team.members
    : [
        ...team.members,
        {
          id: `coach-${team.id}`,
          teamId: team.id,
          userId: team.coachId,
          joinedAt: team.createdAt,
          user: team.coach,
        },
      ];

  return {
    ...team,
    members: membersWithCoach,
    memberCount: membersWithCoach.length,
  };
};

/**
 * Create team
 */
export const createTeam = async (teamData) => {
  const { memberIds = [], staffIds = [], ...data } = teamData;
  const coachId = data.coachId || null;

  // Validate coach is not already assigned to another team
  if (coachId) {
    const existingTeamWithCoach = await prisma.team.findFirst({
      where: { coachId },
    });
    if (existingTeamWithCoach) {
      throw new Error('This coach is already assigned to another team');
    }
  }

  // Create team
  const team = await prisma.team.create({
    data: {
      name: data.name,
      discipline: data.discipline,
      ...(coachId && { coachId }),
      photo: data.photo || null,
    },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      members: {
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
      },
    },
  });

  // Add members (athletes, staff) and coach to team
  const allMemberIds = Array.from(new Set([...memberIds, ...staffIds, ...(coachId ? [coachId] : [])]));
  if (allMemberIds.length > 0) {
    await Promise.all(
      allMemberIds.map((userId) =>
        prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId,
          },
        })
      )
    );
  }

  // Fetch and return complete team with members
  const completeTeam = await prisma.team.findUnique({
    where: { id: team.id },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      members: {
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
      },
    },
  });

  return {
    ...completeTeam,
    memberCount: completeTeam.members.length,
  };
};

/**
 * Update team
 */
export const updateTeam = async (id, teamData) => {
  const { memberIds, staffIds, ...data } = teamData;

  const existingTeam = await prisma.team.findUnique({
    where: { id },
    select: { coachId: true },
  });

  if (!existingTeam) {
    throw new Error('Team not found');
  }

  const coachId = data.coachId !== undefined ? data.coachId : existingTeam.coachId;

  // Validate coach is not already assigned to another team
  if (coachId && coachId !== existingTeam.coachId) {
    const existingTeamWithCoach = await prisma.team.findFirst({
      where: { coachId, id: { not: id } },
    });
    if (existingTeamWithCoach) {
      throw new Error('This coach is already assigned to another team');
    }
  }

  // Update basic team info
  await prisma.team.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.discipline && { discipline: data.discipline }),
      ...(data.coachId !== undefined && { coachId: data.coachId || null }),
      ...(data.photo !== undefined && { photo: data.photo || null }),
    },
  });

  // If memberIds or staffIds are provided, update team members
  if (memberIds !== undefined || staffIds !== undefined) {
    // Remove existing members
    await prisma.teamMember.deleteMany({
      where: { teamId: id },
    });

    // Add new members including coach if set
    const allMemberIds = Array.from(
      new Set([...(memberIds || []), ...(staffIds || []), ...(coachId ? [coachId] : [])])
    );
    if (allMemberIds.length > 0) {
      await Promise.all(
        allMemberIds.map((userId) =>
          prisma.teamMember.create({
            data: {
              teamId: id,
              userId,
            },
          })
        )
      );
    }
  } else if (coachId) {
    // Ensure coach is tracked as a team member even when roster isn't updated
    const coachMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: id,
          userId: coachId,
        },
      },
    });

    if (!coachMembership) {
      await prisma.teamMember.create({
        data: {
          teamId: id,
          userId: coachId,
        },
      });
    }
  }

  // Fetch and return updated team
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      members: {
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
      },
    },
  });

  return {
    ...team,
    memberCount: team.members.length,
  };
};

/**
 * Delete team
 */
export const deleteTeam = async (id) => {
  await prisma.team.delete({
    where: { id },
  });

  return { message: 'Team deleted successfully' };
};

/**
 * Add member to team
 */
export const addMemberToTeam = async (teamId, userId) => {
  const teamMember = await prisma.teamMember.create({
    data: {
      teamId,
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
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return teamMember;
};

/**
 * Remove member from team
 */
export const removeMemberFromTeam = async (teamId, userId) => {
  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  return { message: 'Member removed from team successfully' };
};

