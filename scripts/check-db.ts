import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking DB connection...");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
        const tenantCount = await prisma.tenant.count();
        console.log("Tenant count:", tenantCount);
        console.log("Models seem ok.");
    } catch (e) {
        console.error("DB Check failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
