import { prisma } from "@/lib/prisma";

type AuditAction =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REJECTED"
  | "BOOKING_CHECKED_IN"
  | "BOOKING_CREATED"
  | "TENANT_CREATED"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "PAYMENT_WEBHOOK_RECEIVED";

interface AuditParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  tenantId?: string;
  actorId?: string;
  actorType?: "SUPER_ADMIN" | "TENANT_ADMIN" | "MEMBER" | "SYSTEM";
  metadata?: Record<string, any>;
}

/**
 * Write an immutable audit log entry. Fire-and-forget safe — errors are swallowed
 * so that a logging failure never breaks the main request.
 */
export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        tenantId: params.tenantId,
        actorId: params.actorId,
        actorType: params.actorType,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}
