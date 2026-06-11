import type { UserRole } from "@prisma/client";

// Role hierarchy: OWNER > MANAGER > EMPLOYEE.
// Permissions are expressed as capabilities so UI and server share one source
// of truth, and so finer-grained roles can be added without touching call sites.
const ROLE_LEVEL: Record<UserRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export type Capability =
  | "company.manage" // company settings, billing, locations
  | "team.manage" // invite/deactivate users, change roles
  | "equipment.manage"
  | "cleaning.manage" // create/edit schedules and assignments
  | "cleaning.complete"
  | "temperature.record"
  | "records.manage" // create/edit form templates
  | "records.submit"
  | "alerts.resolve"
  | "reports.view";

const MINIMUM_ROLE: Record<Capability, UserRole> = {
  "company.manage": "OWNER",
  "team.manage": "MANAGER",
  "equipment.manage": "MANAGER",
  "cleaning.manage": "MANAGER",
  "cleaning.complete": "EMPLOYEE",
  "temperature.record": "EMPLOYEE",
  "records.manage": "MANAGER",
  "records.submit": "EMPLOYEE",
  "alerts.resolve": "MANAGER",
  "reports.view": "MANAGER",
};

export function can(role: UserRole, capability: Capability): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[MINIMUM_ROLE[capability]];
}

export function hasMinimumRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimum];
}
