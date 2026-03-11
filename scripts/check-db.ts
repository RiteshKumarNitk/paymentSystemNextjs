import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking DB connection...");
        const users = await prisma.user.findMany();
        // console.log("Users:", users.map((u: any) => ({ email: u.email, role: u.role })));
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
