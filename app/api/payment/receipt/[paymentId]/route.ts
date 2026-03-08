import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { paymentId } = await context.params;
    const payment = await prisma.paymentRequest.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    if (payment.paymentStatus !== "SUCCESS") {
      return NextResponse.json({ error: "Receipt is only available for successful payments." }, { status: 400 });
    }

    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).text("Payment Receipt", { align: "center" });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Receipt No: ${payment.id}`);
      doc.text(`Razorpay Payment ID: ${payment.razorpayPaymentId ?? "N/A"}`);
      doc.text(`Date: ${payment.updatedAt.toLocaleString("en-IN")}`);
      doc.moveDown();
      doc.text(`Customer Name: ${payment.customerName}`);
      doc.text(`Phone: ${payment.customerPhone}`);
      doc.text(`Email: ${payment.customerEmail}`);
      doc.moveDown();
      doc.text(`Ticket Type: ${payment.ticketType}`);
      doc.text(`Amount Paid: INR ${payment.amount}`);
      doc.text(`Status: ${payment.paymentStatus}`);
      doc.moveDown();
      doc.text("Thank you for your payment.", { align: "left" });

      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${payment.id}.pdf`
      }
    });
  } catch (error) {
    console.error("Receipt generation failed:", error);
    return NextResponse.json({ error: "Unable to generate receipt." }, { status: 500 });
  }
}
