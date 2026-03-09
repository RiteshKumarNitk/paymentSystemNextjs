import { prisma } from "./prisma";

/**
 * Resolves a tenant by its unique slug.
 */
export async function getTenantBySlug(slug: string) {
    if (!slug) return null;
    return await prisma.tenant.findUnique({
        where: { slug: slug.toLowerCase() },
    });
}

/**
 * Fetches all active tenants. (Useful for Super Admin)
 */
export async function getAllActiveTenants() {
    return await prisma.tenant.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
    });
}

/**
 * Validates if a tenant exists and is active.
 */
export async function isValidTenant(slug: string) {
    const tenant = await getTenantBySlug(slug);
    return !!tenant && tenant.isActive;
}
