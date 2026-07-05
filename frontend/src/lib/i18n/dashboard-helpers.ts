import { translate, type Locale } from "@/lib/i18n";
import type { ActivityEvent, Achievement } from "@/types";

export function translateAchievementTitle(locale: Locale, achievement: Achievement): string {
  const key = `pages.dashboard.achievements.${achievement.id}`;
  const translated = translate(locale, key);
  return translated === key ? achievement.title : translated;
}

export function translateTrustCategory(locale: Locale, category: string): string {
  const normalized = category.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const key = `pages.dashboard.trustCategories.${normalized}`;
  const translated = translate(locale, key);
  return translated === key ? category : translated;
}

export function translateRiskCategory(locale: Locale, risk: string): string {
  const key = `pages.dashboard.riskCategories.${risk.toLowerCase()}`;
  const translated = translate(locale, key);
  return translated === key ? risk : translated;
}

export function translateRiskLabel(locale: Locale, risk: string): string {
  return translate(locale, "pages.dashboard.riskLabel", {
    category: translateRiskCategory(locale, risk),
  });
}

export function translateLoanRecommendation(
  locale: Locale,
  riskCategory: string,
  fallback?: string
): string {
  const key = `pages.dashboard.loanRecommendations.${riskCategory.toLowerCase()}`;
  const translated = translate(locale, key);
  if (translated !== key) return translated;
  return fallback || translate(locale, "pages.dashboard.calculateLoanFirst");
}

export function translateTrustBreakdownLabel(locale: Locale, rawKey: string): string {
  const normalized = rawKey.replace(/_score/g, "").replace(/_/g, "");
  const map: Record<string, string> = {
    verification: "pages.dashboard.breakdown.verification",
    transactions: "pages.dashboard.breakdown.transactions",
    buyerrating: "pages.dashboard.breakdown.buyerRating",
    government: "pages.dashboard.breakdown.government",
    complaints: "pages.dashboard.breakdown.complaints",
  };
  const key = map[normalized.toLowerCase()];
  return key ? translate(locale, key) : rawKey.replace(/_/g, " ");
}

export function translateMilestoneLabel(locale: Locale, key: string): string {
  const path = `pages.dashboard.milestones.${key}`;
  const translated = translate(locale, path);
  return translated === path ? key : translated;
}

export function translateRewardBadge(locale: Locale, label: string): string {
  const map: Record<string, string> = {
    "Getting Started": "pages.dashboard.rewardBadges.gettingStarted",
    "Profile Builder": "pages.dashboard.rewardBadges.profileBuilder",
    "Farm Ready": "pages.dashboard.rewardBadges.farmReady",
    "Almost Complete": "pages.dashboard.rewardBadges.almostComplete",
    "Profile Champion": "pages.dashboard.rewardBadges.profileChampion",
  };
  const path = map[label];
  return path ? translate(locale, path) : label;
}

export function translateActivityEvent(locale: Locale, event: ActivityEvent): string {
  const { type, title } = event;

  switch (type) {
    case "account_created":
      return translate(locale, "pages.dashboard.events.accountCreated");
    case "land_added":
      return translate(locale, "pages.dashboard.events.landAdded", {
        detail: title.replace(/^Land Added:\s*/i, ""),
      });
    case "crop_added":
      return translate(locale, "pages.dashboard.events.cropAdded", {
        detail: title.replace(/^Crop Added:\s*/i, ""),
      });
    case "scheme_applied":
      return translate(locale, "pages.dashboard.events.schemeApplied", {
        detail: title.replace(/^Scheme Applied:\s*/i, ""),
      });
    case "complaint_filed":
      return translate(locale, "pages.dashboard.events.complaintFiled", {
        detail: title.replace(/^Complaint Filed:\s*/i, ""),
      });
    case "loan_generated":
      return translate(locale, "pages.dashboard.events.loanGenerated");
    case "trust_updated": {
      const match = title.match(/Trust Score Updated:\s*(\d+)\s*\((.+)\)/i);
      if (match) {
        return translate(locale, "pages.dashboard.events.trustUpdated", {
          score: match[1],
          category: translateTrustCategory(locale, match[2]),
        });
      }
      return title;
    }
    default:
      return title;
  }
}

export function translateTransactionStatus(locale: Locale, status: string): string {
  const key = `pages.dashboard.transactionStatus.${status.toLowerCase()}`;
  const translated = translate(locale, key);
  return translated === key ? status : translated;
}
