import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            price: "0",
            description: "Perfect for small communities & local events.",
            features: ["Up to 100 Tickets", "Basic E-Ticketing", "QR Scan Check-in", "Standard Support"],
            buttonText: "Get Started Free",
            featured: false
        },
        {
            name: "Professional",
            price: "1,999",
            description: "Full suite for scaling event organizations.",
            features: ["Unlimited Tickets", "WhatsApp QR Invites", "Member Digital Wallet", "Fast-Pass Verification", "24/7 Priority Support"],
            buttonText: "Go Pro Now",
            featured: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Heavy-duty tech for massive mega-events.",
            features: ["Custom Branding", "Dedicated Account Manager", "API Access", "Heavy Traffic Handling", "Multi-Tenant Control"],
            buttonText: "Contact Sales",
            featured: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <GlobalHeader />

            <main className="py-24 px-8">
                <div className="mx-auto max-w-7xl text-center mb-20">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-8">
                        Simple Tech. <br /> <span className="text-[#F05A44]">Powerful</span> Results.
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Choose the plan that fits your organization's scale. No hidden fees, just pure event-tech efficiency.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl grid gap-10 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`wowsly-card p-12 flex flex-col h-full bg-white transition-all ${plan.featured ? 'border-[#F05A44] border-2 shadow-2xl shadow-red-100 -translate-y-4 scale-105' : ''}`}>
                            {plan.featured && (
                                <span className="self-start px-4 py-1.5 rounded-full bg-[#F05A44] text-white text-[10px] font-black uppercase tracking-widest mb-6">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="text-3xl font-black text-slate-900 mb-4">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                                {plan.price !== "Custom" && <span className="text-slate-400 font-bold uppercase text-[10px]">/ Month</span>}
                            </div>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed min-h-[3rem]">
                                {plan.description}
                            </p>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <span className="text-[#F05A44]">✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button className={`pill-button w-full ${plan.featured ? 'pill-button-primary' : 'bg-slate-900 text-white'}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <GlobalFooter />
        </div>
    );
}
