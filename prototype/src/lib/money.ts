export function parseCents(amount: string): number | null {
  const match = /^(\d*)(?:\.(\d{1,2}))?$/.exec(amount);
  if (!match || (!match[1] && !match[2])) return null;

  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 && cents <= 2_147_483_647 ? cents : null;
}

export function splitEqually(cents: number, memberIds: string[]) {
  const base = Math.floor(cents / memberIds.length);
  const remainder = cents % memberIds.length;
  return memberIds.map((memberId, position) => ({
    memberId,
    position,
    cents: base + (position < remainder ? 1 : 0),
  }));
}

export function formatMoney(cents: number | bigint) {
  const value = BigInt(cents);
  const absolute = value < BigInt(0) ? -value : value;
  return `${value < BigInt(0) ? "-" : ""}$${(absolute / BigInt(100)).toLocaleString("en-US")}.${String(absolute % BigInt(100)).padStart(2, "0")}`;
}
