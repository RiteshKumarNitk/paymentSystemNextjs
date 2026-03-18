"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// Define the shape of TicketTier from Prisma
type TicketTier = {
    id: string;
    name: string;
    price: number;
    capacity: number;
    isActive: boolean;
};

type Props = {
    tenantSlug: string;
    eventId: string;
    ticketTiers: TicketTier[];
    eventCapacity: number;
    eventBookings: number;
    isSoldOut: boolean;
    defaultName?: string;
    defaultEmail?: string;
    defaultPhone?: string;
};

export default function TenantBookingForm({
    tenantSlug,
    eventId,
    ticketTiers,
    eventCapacity,
    eventBookings,
    isSoldOut,
    defaultName = "",
    defaultEmail = "",
    defaultPhone = ""
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // State to hold quantities selected for each tier ID
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // Calculate total cost and total tickets selected
    const { totalCost, totalTickets } = useMemo(() => {
        let cost = 0;
        let tickets = 0;
        Object.entries(quantities).forEach(([tierId, qty]) => {
            const tier = ticketTiers.find(t => t.id === tierId);
            if (tier && qty > 0) {
                cost += tier.price * qty;
                tickets += qty;
            }
        });
        return { totalCost: cost, totalTickets: tickets };
    }, [quantities, ticketTiers]);

    const handleIncrement = (tierId: string, maxAvailable: number | null) => {
        setQuantities(prev => {
            const current = prev[tierId] || 0;
            // Respect individual tier capacity if set (>0), and overall event capacity
            const overallRemaining = eventCapacity > 0 ? eventCapacity - eventBookings - totalTickets : Infinity;
            if (overallRemaining <= 0) return prev; // Cannot add more than overall event capacity
            if (maxAvailable !== null && current >= maxAvailable) return prev; // Cannot add more than tier capacity

            return { ...prev, [tierId]: current + 1 };
        });
    };

    const handleDecrement = (tierId: string) => {
        setQuantities(prev => {
            const current = prev[tierId] || 0;
            if (current <= 0) return prev;
            return { ...prev, [tierId]: current - 1 };
        });
    };

    async function handleSubmit(formData: FormData) {
        if (totalTickets === 0) {
            setError("Please select at least one ticket.");
            return;
        }

        setLoading(true);
        setError(null);

        // Convert selected quantities into array of items for backend
        const selectedItems = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([tierId, qty]) => ({ tierId, quantity: qty }));

        const payload = {
            eventId,
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            items: selectedItems, // NEW PAYLOAD FORMAT FOR MULTIPLE TIERS
            amount: totalCost, // backend will re-verify this
        };

        try {
            const res = await fetch(`/api/${tenantSlug}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed");

            if (totalCost === 0) {
                // Free event
                router.push(`/${tenantSlug}/booking-success?bookingId=${data.bookingId}`);
            } else {
                // Paid event - go to QR
                router.push(`/${tenantSlug}/events/${eventId}/book/${data.bookingId}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (isSoldOut || !ticketTiers || ticketTiers.length === 0) {
        return (
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                <p className="text-xl font-bold text-slate-300">Tickets Unavailable</p>
                <p className="text-sm text-slate-400 mt-2">This event is currently sold out or the tickets are not configured.</p>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Select Tickets</h3>
                {ticketTiers.map((tier) => {
                    const selectedQty = quantities[tier.id] || 0;
                    // Max available logic could be expanded if we track sold per tier in backend.
                    // For now, capping UI manually based on total capacity definition.
                    const tierMax = tier.capacity > 0 ? tier.capacity : null; 
                    
                    return (
                        <div key={tier.id} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors hover:bg-white/15">
                            <div>
                                <p className="font-bold text-white text-lg">{tier.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-indigo-300 font-bold text-sm">₹{tier.price}</p>
                                    {tierMax !== null && (
                                        <span className="text-[10px] bg-white/10 text-slate-300 px-2 rounded-full">Limited</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4 bg-slate-900 rounded-xl px-2 py-1">
                                <button type="button" onClick={() => handleDecrement(tier.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors" disabled={selectedQty <= 0}>–</button>
                                <span className="font-black text-white w-4 text-center">{selectedQty}</span>
                                <button type="button" onClick={() => handleIncrement(tier.id, tierMax)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors">+</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="h-px w-full bg-white/10 my-6"></div>

            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Attendee Details</h3>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input
                        name="name"
                        required
                        defaultValue={defaultName}
                        className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-500"
                        placeholder="e.g. Robin Banks"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={defaultEmail}
                        className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-500"
                        placeholder="robin@gmail.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                    <input
                        name="phone"
                        type="tel"
                        required
                        defaultValue={defaultPhone}
                        className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-500"
                        placeholder="10-digit mobile"
                    />
                </div>
            </div>

            {error && (
                <p className="text-center text-xs font-bold text-red-400 bg-red-400/10 py-3 rounded-xl border border-red-400/20 px-3">
                    ⚠️ {error}
                </p>
            )}

            {/* Sticky Checkout Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</p>
                    <p className="text-3xl font-black text-white">₹{totalCost}</p>
                </div>
                <button
                    type="submit"
                    disabled={loading || totalTickets === 0}
                    className="rounded-2xl bg-indigo-500 px-8 py-4 font-black text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50 disabled:grayscale"
                >
                    {loading ? "Processing..." : totalCost === 0 ? "Get Tickets →" : `Pay ₹${totalCost} →`}
                </button>
            </div>
        </form>
    );
}
