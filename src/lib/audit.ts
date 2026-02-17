import { prisma } from './prisma';

export interface AuditLogParams {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  event: string;
  status: 'SUCCESS' | 'FAILURE';
  resource?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an event to the AuditLog table.
 * This function is designed to be called within API routes or server actions.
 */
export async function logEvent(params: AuditLogParams) {
  try {
    // We use create without await if we don't want to block the main thread,
    // but in Next.js API routes, it's safer to await or use waitUntil to ensure it finishes.
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        event: params.event,
        status: params.status,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // We log to console as a fallback if database logging fails
    console.error('[AUDIT_LOG_ERROR]:', error);
  }
}
