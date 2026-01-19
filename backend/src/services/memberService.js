import prisma from '../config/database.js';
import { hashPassword } from '../utils/bcrypt.js';

/**
 * Get all members with pagination and filters
 */
export const getAllMembers = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where = {};
  
  if (search) {
    where.user = {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // Add status filter (subscriptions are on User, not Member)
  if (status) {
    const subscriptionFilter = {};
    if (status) subscriptionFilter.status = status;

    where.user = {
      ...where.user,
      subscriptions: {
        some: subscriptionFilter,
      },
    };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          include: {
            subscriptions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            discipline: true,
          },
        },
      },
      orderBy: { joinDate: 'desc' },
    }),
    prisma.member.count({ where }),
  ]);

  // Remove password from user objects
  const membersWithoutPassword = members.map((member) => {
    if (member.user && member.user.password) {
      const { password, ...userWithoutPassword } = member.user;
      return {
        ...member,
        user: userWithoutPassword,
      };
    }
    return member;
  });

  return {
    members: membersWithoutPassword,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get member by ID
 */
export const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          discipline: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Remove password from user object
  if (member.user && member.user.password) {
    const { password, ...userWithoutPassword } = member.user;
    member.user = userWithoutPassword;
  }

  return member;
};

/**
 * Create member
 */
export const createMember = async (memberData) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role = 'Athlete',
    address,
    emergencyContact,
    dateOfBirth,
    sports,
    speciality,
    baseSalary,
    teamId,
    weight,
    height,
    strongPoint,
    weakPoint,
    // Coach specific
    specialties,
    certifications,
    experienceYears,
    // Staff specific
    department,
    position,
    hireDate,
    // Photo
    photo,
    ...otherData
  } = memberData;

  // Validation: Phone should be 8 digits only
  if (phone && !/^\d{8}$/.test(phone.replace(/\D/g, ''))) {
    throw new Error('Phone number must be exactly 8 digits');
  }

  // Validation: Emergency contact should be 8 digits only
  if (emergencyContact && !/^\d{8}$/.test(emergencyContact.replace(/\D/g, ''))) {
    throw new Error('Emergency contact must be exactly 8 digits');
  }

  // Validation: Date of birth should be at least 5 years ago
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 5) {
      throw new Error('Member must be at least 5 years old');
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Validate team exists if teamId is provided
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new Error('Team not found');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password || 'defaultPassword123');

  // Normalize phone numbers (remove non-digits, ensure 8 digits)
  const normalizedPhone = phone.replace(/\D/g, '').slice(0, 8);
  const normalizedEmergencyContact = emergencyContact ? emergencyContact.replace(/\D/g, '').slice(0, 8) : null;

  // Validate role
  const validRoles = ['Athlete', 'Coach', 'Staff', 'Admin', 'Manager'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role. Must be one of: Athlete, Coach, Staff');
  }

  // Only Athletes can have Admin/Manager roles through separate registration
  if (role === 'Admin' || role === 'Manager') {
    throw new Error('Admin and Manager roles cannot be assigned through member creation');
  }

  // Validate coach-specific required fields
  if (role === 'Coach' && !specialties) {
    throw new Error('Specialties are required for coaches');
  }

  // Prepare user data
  const userData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone: normalizedPhone,
    role,
    ...otherData,
  };

  // For coaches, store specialties in sportType
  if (role === 'Coach' && specialties) {
    userData.sportType = specialties;
  }

  // Create user and member in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData,
    });

    // Prepare member data based on role
    const memberData = {
      userId: user.id,
      address: address || null,
      emergencyContact: role === 'Athlete' ? normalizedEmergencyContact : null,
      dateOfBirth: role === 'Athlete' && dateOfBirth ? new Date(dateOfBirth) : null,
      sports: role === 'Athlete' ? (sports || []) : [],
      speciality: speciality || null,
      baseSalary: baseSalary ? parseFloat(baseSalary) : null,
      teamId: role === 'Athlete' ? (teamId || null) : null,
      weight: role === 'Athlete' ? (weight ? parseFloat(weight) : null) : null,
      height: role === 'Athlete' ? (height ? parseFloat(height) : null) : null,
      strongPoint: role === 'Athlete' ? (strongPoint || null) : (role === 'Coach' ? certifications || null : null),
      weakPoint: role === 'Athlete' ? (weakPoint || null) : (role === 'Coach' ? (experienceYears ? experienceYears.toString() : null) : null),
      photo: photo || null,
    };

    // For Staff, store department and position in address field as structured data
    if (role === 'Staff') {
      const staffInfo = [];
      if (department) staffInfo.push(`Dept: ${department}`);
      if (position) staffInfo.push(`Position: ${position}`);
      if (hireDate) staffInfo.push(`Hired: ${hireDate}`);
      memberData.address = staffInfo.length > 0 ? staffInfo.join(' | ') : (address || null);
    }

    // Create member
    const member = await tx.member.create({
      data: memberData,
      include: {
        user: {
          include: {
            subscriptions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            discipline: true,
          },
        },
      },
    });

    // If baseSalary is provided, create or update salary record for current month
    if (baseSalary && parseFloat(baseSalary) > 0) {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Map role to salary type
      const roleToSalaryType = {
        'Athlete': 'Player',
        'Coach': 'Coach',
        'Staff': 'Staff',
        'Manager': 'Manager',
        'Admin': 'Manager',
      };
      
      const salaryType = roleToSalaryType[role] || 'Player';
      
      // Use upsert to handle case where salary already exists
      await tx.salary.upsert({
        where: {
          userId_month: {
            userId: user.id,
            month: currentMonth,
          },
        },
        update: {
          amount: parseFloat(baseSalary),
          type: salaryType,
        },
        create: {
          userId: user.id,
          amount: parseFloat(baseSalary),
          month: currentMonth,
          type: salaryType,
          status: 'Pending',
          notes: 'Initial salary record created with member',
        },
      });
    }

    return member;
  });

  return result;
};

/**
 * Update member
 */
export const updateMember = async (id, memberData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    emergencyContact,
    dateOfBirth,
    sports,
    speciality,
    baseSalary,
    teamId,
    weight,
    height,
    strongPoint,
    weakPoint,
    photo,
    ...otherData
  } = memberData;

  // Validation: Phone is required and should be 8 digits only
  if (phone !== undefined) {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    if (!/^\d{8}$/.test(phone.replace(/\D/g, ''))) {
      throw new Error('Phone number must be exactly 8 digits');
    }
  }

  // Validation: Emergency contact should be 8 digits only
  if (emergencyContact && !/^\d{8}$/.test(emergencyContact.replace(/\D/g, ''))) {
    throw new Error('Emergency contact must be exactly 8 digits');
  }

  // Validation: Date of birth should be at least 5 years ago
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 5) {
      throw new Error('Member must be at least 5 years old');
    }
  }

  // Validate team exists if teamId is provided
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new Error('Team not found');
    }
  }

  // Check if member exists
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Check email uniqueness if email is being updated
  if (email && email !== member.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  // Check email uniqueness if email is being updated
  if (email && email !== member.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  // Normalize phone numbers before update
  const normalizedPhone = phone !== undefined ? phone.replace(/\D/g, '').slice(0, 8) : undefined;
  const normalizedEmergencyContact = emergencyContact ? emergencyContact.replace(/\D/g, '').slice(0, 8) : undefined;

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user
    if (firstName || lastName || email || normalizedPhone !== undefined) {
      await tx.user.update({
        where: { id: member.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
          ...otherData,
        },
      });
    }

    // Update member
    const updatedMember = await tx.member.update({
      where: { id },
      data: {
        ...(address !== undefined && { address }),
        ...(normalizedEmergencyContact !== undefined && { emergencyContact: normalizedEmergencyContact }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(sports && { sports }),
        ...(speciality !== undefined && { speciality: speciality || null }),
        ...(baseSalary !== undefined && { baseSalary: baseSalary ? parseFloat(baseSalary) : null }),
        ...(teamId !== undefined && { teamId: teamId || null }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(strongPoint !== undefined && { strongPoint: strongPoint || null }),
        ...(weakPoint !== undefined && { weakPoint: weakPoint || null }),
        ...(photo !== undefined && { photo: photo || null }),
      },
      include: {
        user: {
          include: {
            subscriptions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            discipline: true,
          },
        },
      },
    });

    return updatedMember;
  });

  return result;
};

/**
 * Update member status
 */
export const updateMemberStatus = async (id, status) => {
  // Check if member exists
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Get the most recent subscription
  const latestSubscription = member.user.subscriptions[0];

  if (!latestSubscription) {
    // If no subscription exists, create one with Basic membership
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await prisma.subscription.create({
      data: {
        userId: member.userId,
        type: 'Basic',
        status: status,
        startDate,
        endDate,
        price: 75,
      },
    });
  } else {
    // Update existing subscription status
    await prisma.subscription.update({
      where: { id: latestSubscription.id },
      data: { status },
    });
  }

  // Fetch and return updated member
  const updatedMember = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          discipline: true,
        },
      },
    },
  });

  // Remove password from user object
  if (updatedMember.user && updatedMember.user.password) {
    const { password, ...userWithoutPassword } = updatedMember.user;
    updatedMember.user = userWithoutPassword;
  }

  return updatedMember;
};

/**
 * Delete member
 */
export const deleteMember = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Delete member (cascade will delete user)
  await prisma.member.delete({
    where: { id },
  });

  return { message: 'Member deleted successfully' };
};

