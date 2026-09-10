import { BonusType } from "../entities/referral-bonus.entity"

/**
 * Pure helper functions shared by the referral services. Kept dependency-free
 * (no repositories, no NestJS decorators) so they're easy to unit test in
 * isolation from the database.
 */

/**
 * A referral code with no expiry never expires. Otherwise it's expired once
 * `expiresAt` is strictly in the past relative to `now`.
 */
export function isReferralCodeExpired(expiresAt: Date | null | undefined, now: Date = new Date()): boolean {
  if (!expiresAt) {
    return false
  }
  return expiresAt.getTime() < now.getTime()
}

/**
 * Sums the `amount` field across a list of bonuses (or anything shaped like
 * one), coercing to Number the way the entity's decimal column comes back
 * from TypeORM as a string.
 */
export function sumBonusAmounts(bonuses: Array<{ amount: number | string }>): number {
  return bonuses.reduce((sum, bonus) => sum + Number(bonus.amount), 0)
}

export interface BonusStatsInput {
  amount: number | string
  type: BonusType
  status: "pending" | "processed" | string
}

export interface BonusStatsResult {
  totalEarned: number
  totalPending: number
  totalProcessed: number
  bonusesByType: Record<BonusType, number>
}

/**
 * Aggregates a flat list of bonuses into the totals/breakdown shape used by
 * `ReferralBonusService.getBonusStats`.
 */
export function aggregateBonusStats(bonuses: BonusStatsInput[]): BonusStatsResult {
  const stats: BonusStatsResult = {
    totalEarned: 0,
    totalPending: 0,
    totalProcessed: 0,
    bonusesByType: {
      [BonusType.REFERRAL_REWARD]: 0,
      [BonusType.SIGNUP_BONUS]: 0,
      [BonusType.ACTION_BONUS]: 0,
    },
  }

  for (const bonus of bonuses) {
    const amount = Number(bonus.amount)
    stats.totalEarned += amount
    stats.bonusesByType[bonus.type] += amount

    if (bonus.status === "pending") {
      stats.totalPending += amount
    } else if (bonus.status === "processed") {
      stats.totalProcessed += amount
    }
  }

  return stats
}

/**
 * Referral codes are generated from the alphabet
 * `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` at a fixed length (8 in
 * `ReferralCodeService`). This validates that shape without hitting the
 * database, e.g. for early rejection of an obviously malformed code.
 */
export function isValidReferralCodeFormat(code: string, expectedLength = 8): boolean {
  if (typeof code !== "string" || code.length !== expectedLength) {
    return false
  }
  return /^[A-Z0-9]+$/.test(code)
}
