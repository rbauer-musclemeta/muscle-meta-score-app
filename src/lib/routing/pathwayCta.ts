import { ctaMap } from "@/content/pathways/ctaMap";
import type { CtaPayload } from "@/types/results";

function normalizePillarKey(key: string): string {
  if (key === "balance_brain") {
    // TODO: Remove this alias when all config files standardize on one key.
    return "balance_brain_health";
  }
  return key;
}

export function getCtaByKey(key: string): CtaPayload | undefined {
  return ctaMap.ctas[key];
}

export function getFunctionalFallbackCtaKey(lowestPillar: string): string {
  const normalizedKey = normalizePillarKey(lowestPillar);
  return (
    ctaMap.rules.functionalFallbackByLowestPillar[normalizedKey] ??
    "functional_exercise_mobility"
  );
}
