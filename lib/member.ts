import { cookies } from "next/headers";
import { prisma } from "./prisma";

/**
 * Server-side helper to read the logged-in member for a specific tenant.
 */
export async function getLoggedInMember(tenantId: string) {
    const cookieStore = await cookies();
    // We need to know the tenant slug to get the right token
    // For now, let's assume we pass the tenantId and can find the slug, or vice versa
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return null;

    const token = cookieStore.get(`member_token_${tenant.slug}`)?.value;
    if (!token) return null;

    return await prisma.member.findFirst({
        where: {
            id: token,
            tenantId: tenantId,
        },
    });
}

/**
 * Alternative helper that takes the tenant slug directly (from URL params)
 */
export async function getLoggedInMemberBySlug(slug: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(`member_token_${slug}`)?.value;
    if (!token) return null;

    return await prisma.member.findFirst({
        where: {
            id: token,
            tenant: { slug: slug },
        },
    });
}
