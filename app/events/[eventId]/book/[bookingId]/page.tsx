import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { buildUpiPaymentLink, getUpiConfig } from "@/lib/upi";
import UtrSubmitForm from "./UtrSubmitForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ eventId: string; bookingId: string }> };

export default async function BookingQrPage({ params }: Props) {
    const { bookingId } = await params;
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { event: { select: { title: true, id: true, date: true } } }
    });

    if (!booking) notFound();

    let upiLink = "";
    let qrDataUrl = "";
    let upiError = "";

    try {
        const { upiId, businessName } = getUpiConfig();
        upiLink = buildUpiPaymentLink({ upiId, businessName, amount: booking.amount, orderId: booking.orderId });
        qrDataUrl = await QRCode.toDataURL(upiLink, { width: 260 });
    } catch (e) {
        upiError = e instanceof Error ? e.message : "UPI configuration error.";
    }

    const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="mx-auto max-w-lg px-4">
                <Link href={`/events/${booking.event.id}`} className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700">
                    ← Back to Event
                </Link>
                <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Payment Required</p>
                        <h1 className="text-xl font-bold mt-1">{booking.event.title}</h1>
                        <p className="text-sm opacity-80">{formatDate(booking.event.date)} · {formatTime(booking.event.date)}</p>
                    </div>

                    {/* Booking info */}
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                            <div><p className="text-slate-400">Booking ID</p><p className="font-mono font-medium text-xs">{booking.orderId}</p></div>
                            <div><p className="text-slate-400">Name</p><p className="font-medium">{booking.name}</p></div>
                            <div><p className="text-slate-400">Amount</p><p className="text-xl font-extrabold text-indigo-700">₹{booking.amount}</p></div>
                            <div><p className="text-slate-400">Status</p><p className="capitalize font-medium">{booking.status.replace("_", " ")}</p></div>
                        </div>

                        {upiError ? (
                            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{upiError}</p>
                        ) : (
                            <div className="space-y-3">
                                {/* Steps */}
                                <div className="text-sm text-slate-600 space-y-1.5">
                                    <p className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">1</span>Scan the QR code with any UPI app</p>
                                    <p className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">2</span>Pay exactly <strong>₹{booking.amount}</strong></p>
                                    <p className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">3</span>Copy the UTR and submit below</p>
                                </div>

                                <div className="flex justify-center py-2">
                                    <Image src={qrDataUrl} alt="UPI QR Code" width={240} height={240} className="rounded-2xl border-4 border-indigo-100" />
                                </div>

                                <Link href={upiLink}
                                    className="block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center font-bold text-white transition hover:opacity-90">
                                    Open UPI App →
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="p-5 pt-0">
                        <UtrSubmitForm orderId={booking.orderId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
