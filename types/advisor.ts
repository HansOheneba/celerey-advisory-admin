import type { AppRole, IdentityRole } from "@/lib/auth/roles";

export type Advisor = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roles: IdentityRole[];
  clientCount: number;
  createdAt?: string;
};

export type AdvisorListResult = {
  items: Advisor[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
