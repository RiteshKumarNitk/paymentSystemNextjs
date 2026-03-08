import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">Manual Payment Collection</h1>
      <p className="text-slate-600">
        Use the admin panel to create payment links for tickets not booked via BookMyShow.
      </p>
      <div className="flex gap-3">
        <Link
          href="/admin/create-payment"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
        >
          Create Payment
        </Link>
        <Link
          href="/admin/payments"
          className="rounded-lg border border-slate-300 px-4 py-2 transition hover:bg-slate-100"
        >
          View Payments
        </Link>
      </div>
    </main>
  );
}
