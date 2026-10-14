import "server-only";
import { db } from "@/lib/db";

export class InsufficientCreditsError extends Error {
  constructor(public needed: number, public balance: number) {
    super(`Not enough credits: this call needs ${needed}, your balance is ${balance}.`);
  }
}

/** Add credits (plan renewal, top-up, welcome). */
export async function grantCredits(accountId: string, amount: number, reason: string) {
  return db.$transaction(async (tx) => {
    const acc = await tx.account.update({ where: { id: accountId }, data: { credits: { increment: amount } } });
    await tx.creditTransaction.create({ data: { accountId, amount, balanceAfter: acc.credits, reason } });
    return acc.credits;
  });
}

/**
 * Spend credits atomically: the balance can never go below zero, even with concurrent calls.
 * Throws InsufficientCreditsError when the balance is too low.
 */
export async function spendCredits(accountId: string, amount: number, reason: string) {
  if (amount <= 0) return null;
  return db.$transaction(async (tx) => {
    const r = await tx.account.updateMany({ where: { id: accountId, credits: { gte: amount } }, data: { credits: { decrement: amount } } });
    const acc = await tx.account.findUniqueOrThrow({ where: { id: accountId }, select: { credits: true } });
    if (!r.count) throw new InsufficientCreditsError(amount, acc.credits);
    await tx.creditTransaction.create({ data: { accountId, amount: -amount, balanceAfter: acc.credits, reason } });
    return acc.credits;
  });
}

/** Give back credits for a call that failed after charging. */
export async function refundCredits(accountId: string, amount: number, reason: string) {
  if (amount > 0) await grantCredits(accountId, amount, `Refund: ${reason}`);
}
