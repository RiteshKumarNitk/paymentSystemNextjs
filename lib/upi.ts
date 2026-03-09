export function getUpiConfig() {
  const upiId = process.env.UPI_ID;
  const businessName = process.env.UPI_BUSINESS_NAME;

  if (!upiId || !businessName) {
    throw new Error("Missing UPI_ID or UPI_BUSINESS_NAME in environment variables.");
  }

  return { upiId, businessName };
}

export function buildUpiPaymentLink(input: {
  upiId: string;
  businessName: string;
  amount: number;
  orderId: string;
}) {
  const params = new URLSearchParams({
    pa: input.upiId,
    pn: input.businessName,
    am: String(input.amount),
    cu: "INR",
    tn: input.orderId
  });

  return `upi://pay?${params.toString()}`;
}
