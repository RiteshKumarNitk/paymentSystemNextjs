import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import logger from "@/lib/logger";

/**
 * Razorpay Webhook Handler
 *
 * Setup in Razorpay Dashboard:
 * URL: https://<your-domain>/api/<tenantSlug>/webhook/razorpay
 * Events: payment.captured, payment.failed
 *
 * Each tenant can have their own webhook secret stored in Tenant.razorpayWebhookSecret
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;

        // 1. Fetch tenant and its webhook secret
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const webhookSecret = tenant.razorpayWebhookSecret;
        if (!webhookSecret) {
            logger.warn({ tenantSlug }, "[Webhook] Tenant has no Razorpay webhook secret configured");
            return NextResponse.json({ error: "Webhook not configured for this tenant" }, { status: 400 });
        }

        // 2. Verify HMAC signature
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            logger.warn({ tenantSlug }, "[Webhook] Invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 3. Parse event payload
        const event = JSON.parse(rawBody);
        const eventType = event.event; // "payment.captured" | "payment.failed"

        await writeAuditLog({
            action: "PAYMENT_WEBHOOK_RECEIVED",
            entityType: "Payment",
            entityId: event?.payload?.payment?.entity?.id ?? "unknown",
            tenantId: tenant.id,
            actorType: "SYSTEM",
            metadata: { eventType },
        });

        if (eventType === "payment.captured") {
            const payment = event.payload?.payment?.entity;
            const razorpayOrderId: string = payment?.order_id;
            const razorpayPaymentId: string = payment?.id;

            if (!razorpayOrderId) {
                return NextResponse.json({ error: "Missing order_id in payload" }, { status: 400 });
            }

            // 4. Find and auto-confirm the booking
            const booking = await prisma.booking.findUnique({
                where: { razorpayOrderId },
            });

            if (!booking) {
                logger.warn({ tenantSlug, razorpayOrderId }, "[Webhook] No booking found for razorpayOrderId");
                return NextResponse.json({ error: "Booking not found" }, { status: 404 });
            }

            if (booking.status === "confirmed") {
                // Already confirmed — idempotent, return 200
                return NextResponse.json({ received: true });
            }

            const previousStatus = booking.status;
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: "confirmed",
                    razorpayPaymentId,
                },
            });

            await writeAuditLog({
                action: "BOOKING_CONFIRMED",
                entityType: "Booking",
                entityId: booking.id,
                tenantId: tenant.id,
                actorType: "SYSTEM",
                metadata: {
                    razorpayPaymentId,
                    razorpayOrderId,
                    previousStatus,
                    amount: payment.amount / 100, // paisa → rupees
                },
            });

            logger.info({ bookingId: booking.id, tenantSlug, razorpayPaymentId }, "[Webhook] Booking confirmed via Razorpay");
        }

        if (eventType === "payment.failed") {
            const payment = event.payload?.payment?.entity;
            const razorpayOrderId: string = payment?.order_id;

            if (razorpayOrderId) {
                const booking = await prisma.booking.findUnique({
                    where: { razorpayOrderId },
                });

                if (booking && booking.status === "pending") {
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { status: "rejected" },
                    });

                    await writeAuditLog({
                        action: "BOOKING_REJECTED",
                        entityType: "Booking",
                        entityId: booking.id,
                        tenantId: tenant.id,
                        actorType: "SYSTEM",
                        metadata: { reason: "Payment failed", razorpayOrderId },
                    });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error(error, "[Webhook] Error processing Razorpay webhook");
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
