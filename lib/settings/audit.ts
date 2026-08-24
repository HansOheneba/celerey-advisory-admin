export type AuditLogEntry = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  occurredAt: string;
};
