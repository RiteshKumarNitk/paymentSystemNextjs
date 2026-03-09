import React from "react";

interface RevenueData {
    date: string;
    amount: number;
}

export default function RevenueChart({ data, color = "#4F46E5" }: { data: RevenueData[], color?: string }) {
    if (data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(d => d.amount), 100);
    const chartHeight = 120;
    const chartWidth = 400;
    const barWidth = (chartWidth / data.length) - 8;

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-1 h-[120px] mb-4">
                {data.map((d, i) => {
                    const barHeight = (d.amount / maxRevenue) * chartHeight;
                    return (
                        <div key={i} className="group relative flex-1 flex flex-col items-center">
                            <div
                                className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                                style={{
                                    height: `${barHeight}px`,
                                    backgroundColor: color,
                                    opacity: 0.1 + (barHeight / chartHeight) * 0.9
                                }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl z-10 pointer-events-none whitespace-nowrap">
                                ₹{d.amount.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data[0].date}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data[data.length - 1].date}</span>
            </div>
        </div>
    );
}
