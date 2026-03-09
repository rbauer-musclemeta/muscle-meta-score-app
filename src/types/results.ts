export interface CtaPayload {
  label: string;
  secondaryLabel: string;
  target: string;
  resultTitle?: string;
  resultSubtitle?: string;
  badge?: string;
  focus?: string;
}

export interface CatabolicResult {
  surveyId: string;
  totalScore: number;
  riskBand: "no_flag" | "watch" | "active_recovery" | "high_risk";
  riskLabel: string;
  primaryPathway: string;
  pathwayTag: string;
  redFlags: string[];
  recommendedCta: {
    primary: string;
    secondary: string;
  };
  summary: string;
}

export interface FunctionalResult {
  surveyId: string;
  totalScore: number;
  totalBand:
    | "resilient"
    | "stable_weak_links"
    | "early_pattern"
    | "moderate_risk"
    | "high_risk";
  totalLabel: string;
  categoryScores: Record<string, number>;
  pillarScores: Record<string, { raw: number; percent: number }>;
  weakestPillar: string;
  strongestPillar: string;
  lowestCategory: string;
  topFocusAreas: string[];
  redFlags: string[];
  recommendedCta: {
    primary: string;
    secondary: string;
  };
  summary: string;
}

export interface CombinedResultSnapshot {
  id: string;
  createdAt: number;
  catabolic: CatabolicResult;
  functional: FunctionalResult;
}
