"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function EventCheckInPage() {
    const params = useParams();
    const router = useRouter();
    const tenantSlug = params.tenantSlug as string;
    const eventId = params.eventId as string;

    const [isScanning, setIsScanning] = useState(true);
    const [manualId, setManualId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
        details?: string;
    } | null>(null);

    // Reference to the scanner instance so we can pause/resume it
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // We only want to initialize the scanner once the component mounts on the client
        if (typeof window === 'undefined') return;

        // Html5QrcodeScanner automatically mounts UI and handles camera permissions
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    const onScanSuccess = async (decodedText: string) => {
        // Pause scanning while we verify
        setIsScanning(false);
        setScanResult(null);

        // Expecting JSON string from our ReactQRCode: {"id":"...", "orderId":"..."}
        let bookingId = "";
        try {
            const data = JSON.parse(decodedText);
            bookingId = data.id;
        } catch (e) {
            // Fallback in case they scanned raw text or an old ticket format
            bookingId = decodedText;
        }

        try {
            const response = await fetch(`/api/${tenantSlug}/admin/events/${eventId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });

            const result = await response.json();

            if (response.ok) {
                setScanResult({
                    success: true,
                    message: `✅ Access Granted: ${result.name}`,
                    details: result.tickets
                });
                // Play success sound
                playBeep(800, 200); 
            } else {
                setScanResult({
                    success: false,
                    message: `❌ Access Denied`,
                    details: result.error || "Invalid Ticket"
                });
                // Play error buzz
                playBeep(200, 500);
            }
        } catch (error) {
            setScanResult({
                success: false,
                message: "Network Error",
                details: "Please try again or manually verify."
            });
        }

        // Auto-resume after 3 seconds so they can scan the next person fast!
        setTimeout(() => {
            setScanResult(null);
            setIsScanning(true);
            setIsSubmitting(false);
        }, 3000);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualId.trim() || isSubmitting) return;

        setIsScanning(false);
        setIsSubmitting(true);
        setScanResult(null);

        try {
            const response = await fetch(`/api/${tenantSlug}/admin/events/${eventId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: manualId.trim() })
            });

            const result = await response.json();

            if (response.ok) {
                setScanResult({
                    success: true,
                    message: `✅ Access Granted: ${result.name}`,
                    details: result.tickets
                });
                playBeep(800, 200);
                setManualId(""); // Clear on success
            } else {
                setScanResult({
                    success: false,
                    message: `❌ Access Denied`,
                    details: result.error || "Invalid Ticket"
                });
                playBeep(200, 500);
            }
        } catch (error) {
            setScanResult({
                success: false,
                message: "Network Error",
                details: "Please try again."
            });
        }

        setTimeout(() => {
            setScanResult(null);
            setIsScanning(true);
            setIsSubmitting(false);
        }, 3000);
    };

    const onScanFailure = (error: any) => {
        // html5-qrcode fires this every frame it doesn't find a code.
        // We generally ignore this.
    };

    // Very simple beep generator for hardware scanner feel
    const playBeep = (freq: number, duration: number) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.frequency.value = freq;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), duration);
        } catch (e) {
            // Ignore if audio API restricted by browser
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 text-white flex flex-col">
            <header className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight">Scanner Terminal</h1>
                    <p className="text-[10px] uppercase tracking-widest text-[#F05A44] font-bold mt-1">Live Check-in System</p>
                </div>
                <button 
                    onClick={() => router.push(`/${tenantSlug}/admin/events`)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                    Exit
                </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* Result Overlay Full Screen Flash */}
                {scanResult && (
                    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200 ${scanResult.success ? 'bg-emerald-500' : 'bg-red-600'}`}>
                        <div className="text-8xl mb-6">{scanResult.success ? '🎫' : '✋'}</div>
                        <h2 className="text-4xl font-black tracking-tight text-center mb-4">{scanResult.message}</h2>
                        {scanResult.details && (
                            <p className="text-xl font-bold bg-black/20 px-6 py-3 rounded-2xl">{scanResult.details}</p>
                        )}
                    </div>
                )}

                {/* The Scanner Viewfinder Container */}
                <div className="w-full max-w-md mx-auto aspect-square relative rounded-[3rem] overflow-hidden shadow-2xl bg-black border-4 border-slate-800">
                    <div id="reader" className="w-full h-full"></div>
                    
                    {!isScanning && !scanResult && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-[#F05A44] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Verifying...</span>
                            </div>
                        </div>
                    )}

                    {/* Scanner Crosshairs Design */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/40 z-20"></div>
                </div>

                <div className="w-full max-w-md mt-12 bg-slate-800 p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Scanner Status</h3>
                        {isScanning ? (
                            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                READY
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-slate-500">PAUSED</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Point your camera at the attendee's digital ticket. The system will automatically scan and verify the QR code.</p>
                </div>

                <div className="w-full max-w-md mt-4 bg-slate-800/50 border border-slate-700/50 p-6 rounded-3xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Manual Entry Fallback</h3>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Type Order ID (e.g., EP-XYZ123)"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#F05A44]"
                        />
                        <button 
                            type="submit"
                            disabled={isSubmitting || !manualId.trim()}
                            className="bg-[#F05A44] hover:bg-[#d04935] disabled:bg-slate-700 text-white font-black text-xs uppercase tracking-widest px-5 rounded-2xl transition"
                        >
                            Verify
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
