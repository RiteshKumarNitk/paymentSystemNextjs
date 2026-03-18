const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Ticket Tiers...");

    // Find a tenant (test-org-123 or any active)
    const tenant = await prisma.tenant.findFirst({
        where: { isActive: true },
        include: { events: true }
    });

    if (!tenant || tenant.events.length === 0) {
        console.log("No active tenant with events found. Please create an event first.");
        return;
    }

    const event = tenant.events[0]; // pick the first event

    console.log(`Adding tiers to Event: ${event.title} (ID: ${event.id})`);

    // Clean up existing to prevent duplicates
    await prisma.ticketTier.deleteMany({
        where: { eventId: event.id }
    });

    // Create 3 tiers
    const tiers = [
        {
            name: "General Admission",
            price: event.price > 0 ? event.price : 499,
            capacity: 500,
            eventId: event.id
        },
        {
            name: "VIP Premium",
            price: event.price > 0 ? event.price * 3 : 1499,
            capacity: 50,
            eventId: event.id
        },
        {
            name: "Backstage Pass",
            price: event.price > 0 ? event.price * 10 : 4999,
            capacity: 10,
            eventId: event.id
        }
    ];

    for (const tierData of tiers) {
        const tier = await prisma.ticketTier.create({ data: tierData });
        console.log(`Created Tier: ${tier.name} - ₹${tier.price} (Cap: ${tier.capacity})`);
    }

    console.log("Seed completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
