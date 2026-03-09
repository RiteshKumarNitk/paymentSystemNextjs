"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AdminQRScanner({ tenantSlug }: { tenantSlug: string }) {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(result: string) {
            scanner.clear();
            handleScan(result);
        }

        function onScanFailure(error: any) {
            // Silence noise
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    const handleScan = async (data: string) => {
        setScanResult(data);
        setLoading(true);
        setError(null);
        setCheckInStatus(null);

        try {
            // 1. Parse Data
            const parsed = JSON.parse(data);
            if (parsed.tenant !== tenantSlug) {
                throw new Error("Invalid Ticket: This pass belongs to another organization.");
            }

            // 2. Fetch Booking Status
            const res = await fetch(`/api/${tenantSlug}/admin/bookings/verify-ticket?bookingId=${parsed.id}`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Failed to verify ticket.");

            setBookingData(json.booking);
        } catch (err: any) {
            setError(err.message || "Invalid QR Code format.");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!bookingData) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/${tenantSlug}/admin/bookings/check-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: bookingData.id })
            });

            if (!res.ok) throw new Error("Check-in failed.");

            setCheckInStatus("success");
            setBookingData({ ...bookingData, checkedInAt: new Date().toISOString() });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setScanResult(null);
        setBookingData(null);
        setError(null);
        setCheckInStatus(null);
        window.location.reload(); // Re-mount scanner
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!scanResult ? (
                <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-slate-100 p-8 text-center">
                    <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Entry Scanner</h2>
                    <div id="reader" className="w-full overflow-hidden rounded-3xl"></div>
                    <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Hold ticket QR code steady in front of camera</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Verification</h2>
                        <button onClick={reset} className="text-xs font-black text-indigo-600 uppercase tracking-widest">New Scan</button>
                    </div>

                    {loading && <div className="py-12 text-center animate-pulse">Checking credentials...</div>}

                    {error && (
                        <div className="rounded-3xl bg-red-50 p-8 text-center border border-red-100">
                            <span className="text-4xl mb-4 block">❌</span>
                            <p className="text-sm font-bold text-red-600">{error}</p>
                            <button onClick={reset} className="mt-6 rounded-2xl bg-red-600 px-6 py-3 text-xs font-black text-white uppercase tracking-widest">Try Again</button>
                        </div>
                    )}

                    {bookingData && (
                        <div className="space-y-6">
                            <div className="rounded-3xl bg-slate-50 p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Event Pass</p>
                                <h3 className="text-lg font-bold text-slate-900">{bookingData.event.title}</h3>
                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendee</p>
                                        <p className="text-sm font-bold text-slate-900">{bookingData.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref</p>
                                        <p className="text-sm font-bold text-slate-900 font-mono">#{bookingData.orderId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-3xl p-6 border ${bookingData.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</p>
                                        <p className={`text-sm font-black ${bookingData.status === 'confirmed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            {bookingData.status.toUpperCase()}
                                        </p>
                                    </div>
                                    {bookingData.checkedInAt && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Already In</p>
                                            <p className="text-xs font-bold text-emerald-700">{new Date(bookingData.checkedInAt).toLocaleTimeString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {bookingData.status === 'confirmed' && !bookingData.checkedInAt ? (
                                <button
                                    onClick={handleCheckIn}
                                    disabled={loading}
                                    className="w-full rounded-[2rem] bg-indigo-600 py-5 text-lg font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                                >
                                    Confirm Entry Pass
                                </button>
                            ) : bookingData.checkedInAt ? (
                                <div className="rounded-[2rem] bg-slate-900 py-5 text-center text-lg font-black text-white">
                                    CHECKED-IN ✅
                                </div>
                            ) : (
                                <div className="rounded-[2rem] bg-slate-100 py-5 text-center text-lg font-black text-slate-400 cursor-not-allowed">
                                    ACCESS DENIED: PAYMENT PENDING
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
