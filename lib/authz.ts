import { UserRole } from '@prisma/client';

const roleRank: Record<UserRole, number> = {
  OWNER: 5,
  MANAGER: 4,
  ACCOUNTANT: 3,
  ANALYST: 2,
  CLIENT: 1
};

export const canManageCompanies = (role: UserRole) => roleRank[role] >= roleRank.MANAGER;
export const canCreateAssignments = (role: UserRole) => roleRank[role] >= roleRank.ACCOUNTANT;
export const canViewFinancialSignals = (role: UserRole) => roleRank[role] >= roleRank.CLIENT;
