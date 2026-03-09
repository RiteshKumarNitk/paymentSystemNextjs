export function normalizeAmountRupees(amount: unknown): number {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    throw new Error("Amount must be a valid number.");
  }

  const rounded = Math.round(parsed);
  if (rounded !== parsed || rounded < 1 || rounded > 500000) {
    throw new Error("Amount must be a whole number between 1 and 500000.");
  }

  return rounded;
}

export function normalizePhone(phone: unknown): string {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  throw new Error("Phone must be a valid 10-digit Indian mobile number.");
}

export function generateOrderId() {
  const now = Date.now();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${now}-${random}`;
}

export function normalizeUtr(utr: unknown): string {
  const value = String(utr ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{8,30}$/.test(value)) {
    throw new Error("UTR must be 8 to 30 alphanumeric characters.");
  }
  return value;
}
