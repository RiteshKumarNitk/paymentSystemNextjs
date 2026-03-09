import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Create Super Admin
    const superAdminEmail = "superadmin@eventpass.com";
    const superAdminPassword = "admin123";
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    console.log(`- Attempting to upsert Super Admin: ${superAdminEmail}`);
    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: { passwordHash: hashedPassword },
        create: {
            email: superAdminEmail,
            passwordHash: hashedPassword,
            role: "SUPER_ADMIN",
        },
    });
    console.log("✅ Super Admin ready:", superAdmin.email);

    // 2. Create Test Tenant
    const testTenantSlug = "test-org";
    console.log(`- Attempting to upsert Tenant: ${testTenantSlug}`);
    const testTenant = await prisma.tenant.upsert({
        where: { slug: testTenantSlug },
        update: { name: "Test Organization" },
        create: {
            name: "Test Organization",
            slug: testTenantSlug,
            upiId: "test@upi",
            upiName: "Test Org Merchant",
            isActive: true,
        },
    });
    console.log("✅ Test Tenant ready:", testTenant.slug);

    // 3. Create Tenant Admin for the Test Tenant
    const tenantAdminEmail = "admin@testorg.com";
    const tenantAdminPassword = "password123";
    const hashedTenantPassword = await bcrypt.hash(tenantAdminPassword, 10);

    console.log(`- Attempting to upsert Tenant Admin: ${tenantAdminEmail}`);
    const tenantAdmin = await prisma.user.upsert({
        where: { email: tenantAdminEmail },
        update: { passwordHash: hashedTenantPassword, tenantId: testTenant.id },
        create: {
            email: tenantAdminEmail,
            passwordHash: hashedTenantPassword,
            role: "TENANT_ADMIN",
            tenantId: testTenant.id,
        },
    });
    console.log("✅ Tenant Admin ready:", tenantAdmin.email);

    console.log("✨ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
