export const SCORE_MAX = {
  verification: 20,
  transaction: 30,
  buyer_rating: 20,
  government: 15,
  complaint: 15,
} as const;

export type TrustScoreComponents = {
  verification_score: number;
  transaction_score: number;
  buyer_rating_score: number;
  government_score: number;
  complaint_score: number;
};

export type TrustScoreResult = TrustScoreComponents & {
  total_score: number;
  category: string;
};

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function categorizeTrustScore(total: number): string {
  if (total >= 85) return "Excellent";
  if (total >= 70) return "Good";
  if (total >= 50) return "Average";
  return "High Risk";
}

/** Client-side trust score simulation matching backend calculate_trust_score. */
export function simulateTrustScore(components: TrustScoreComponents): TrustScoreResult {
  const verification_score = clamp(components.verification_score, SCORE_MAX.verification);
  const transaction_score = clamp(components.transaction_score, SCORE_MAX.transaction);
  const buyer_rating_score = clamp(components.buyer_rating_score, SCORE_MAX.buyer_rating);
  const government_score = clamp(components.government_score, SCORE_MAX.government);
  const complaint_score = clamp(components.complaint_score, SCORE_MAX.complaint);

  const total_score =
    verification_score +
    transaction_score +
    buyer_rating_score +
    government_score +
    complaint_score;

  return {
    verification_score,
    transaction_score,
    buyer_rating_score,
    government_score,
    complaint_score,
    total_score,
    category: categorizeTrustScore(total_score),
  };
}
