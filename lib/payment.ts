export function normalizeAmountRupees(amount: unknown): number {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  const rounded = Math.round(parsed);
  if (rounded !== parsed) {
    throw new Error("Amount must be a whole number in rupees.");
  }
  return rounded;
}
