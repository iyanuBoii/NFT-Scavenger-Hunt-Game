import { BonusType } from "../entities/referral-bonus.entity";
import {
  aggregateBonusStats,
  isReferralCodeExpired,
  isValidReferralCodeFormat,
  sumBonusAmounts,
} from "./referral.utils";

describe("isReferralCodeExpired", () => {
  it("returns false when there is no expiry date", () => {
    expect(isReferralCodeExpired(null)).toBe(false);
    expect(isReferralCodeExpired(undefined)).toBe(false);
  });

  it("returns true when expiresAt is in the past", () => {
    const now = new Date("2026-01-15T00:00:00Z");
    const expiresAt = new Date("2026-01-01T00:00:00Z");
    expect(isReferralCodeExpired(expiresAt, now)).toBe(true);
  });

  it("returns false when expiresAt is in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2026-01-15T00:00:00Z");
    expect(isReferralCodeExpired(expiresAt, now)).toBe(false);
  });

  it("returns false when expiresAt equals now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isReferralCodeExpired(new Date(now), now)).toBe(false);
  });
});

describe("sumBonusAmounts", () => {
  it("returns 0 for an empty list", () => {
    expect(sumBonusAmounts([])).toBe(0);
  });

  it("sums numeric amounts", () => {
    expect(sumBonusAmounts([{ amount: 10 }, { amount: 2.5 }])).toBe(12.5);
  });

  it("coerces string amounts the way TypeORM decimal columns come back", () => {
    expect(sumBonusAmounts([{ amount: "10.00" }, { amount: "5.00" }])).toBe(15);
  });
});

describe("isValidReferralCodeFormat", () => {
  it("accepts an 8-character uppercase alphanumeric code", () => {
    expect(isValidReferralCodeFormat("AB12CD34")).toBe(true);
  });

  it("rejects a code of the wrong length", () => {
    expect(isValidReferralCodeFormat("AB12")).toBe(false);
    expect(isValidReferralCodeFormat("AB12CD34EF")).toBe(false);
  });

  it("rejects lowercase or non-alphanumeric characters", () => {
    expect(isValidReferralCodeFormat("ab12cd34")).toBe(false);
    expect(isValidReferralCodeFormat("AB12-D34")).toBe(false);
  });

  it("respects a custom expected length", () => {
    expect(isValidReferralCodeFormat("AB12", 4)).toBe(true);
  });

  it("rejects non-string input without throwing", () => {
    // @ts-expect-error deliberately passing a non-string to check runtime safety
    expect(isValidReferralCodeFormat(12345678)).toBe(false);
  });
});

describe("aggregateBonusStats", () => {
  it("returns zeroed totals for an empty list", () => {
    const stats = aggregateBonusStats([]);
    expect(stats.totalEarned).toBe(0);
    expect(stats.totalPending).toBe(0);
    expect(stats.totalProcessed).toBe(0);
    expect(stats.bonusesByType[BonusType.REFERRAL_REWARD]).toBe(0);
    expect(stats.bonusesByType[BonusType.SIGNUP_BONUS]).toBe(0);
    expect(stats.bonusesByType[BonusType.ACTION_BONUS]).toBe(0);
  });

  it("splits totals across pending and processed bonuses", () => {
    const stats = aggregateBonusStats([
      { amount: 10, type: BonusType.REFERRAL_REWARD, status: "pending" },
      { amount: 5, type: BonusType.SIGNUP_BONUS, status: "processed" },
      { amount: 2.5, type: BonusType.ACTION_BONUS, status: "pending" },
    ]);

    expect(stats.totalEarned).toBe(17.5);
    expect(stats.totalPending).toBe(12.5);
    expect(stats.totalProcessed).toBe(5);
  });

  it("buckets amounts by bonus type", () => {
    const stats = aggregateBonusStats([
      { amount: 10, type: BonusType.REFERRAL_REWARD, status: "processed" },
      { amount: 10, type: BonusType.REFERRAL_REWARD, status: "processed" },
      { amount: 5, type: BonusType.SIGNUP_BONUS, status: "processed" },
    ]);

    expect(stats.bonusesByType[BonusType.REFERRAL_REWARD]).toBe(20);
    expect(stats.bonusesByType[BonusType.SIGNUP_BONUS]).toBe(5);
    expect(stats.bonusesByType[BonusType.ACTION_BONUS]).toBe(0);
  });

  it("ignores unrecognized statuses when bucketing pending/processed totals", () => {
    const stats = aggregateBonusStats([
      { amount: 10, type: BonusType.REFERRAL_REWARD, status: "failed" },
    ]);

    expect(stats.totalEarned).toBe(10);
    expect(stats.totalPending).toBe(0);
    expect(stats.totalProcessed).toBe(0);
  });
});
