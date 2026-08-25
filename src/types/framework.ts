// Mirrors the Framework Reference Layer defined in convex/schema.ts and
// seeded from config/framework-taxonomy.json. Keep these in sync by hand
// until Convex codegen is wired up against a real deployment (see
// convex/_generated/* stubs and the README note about them).

export type PillarKey =
  | "exercise_mobility"
  | "nutrition_metabolism"
  | "recovery_stress"
  | "balance_brain_health";

export type GmmbbAxisKey = "gut" | "muscle" | "metabolic" | "bone" | "brain";

export type PopulationOverlayKey =
  | "pickleball"
  | "osteoporosis"
  | "glp1"
  | "post_hospital"
  | "perimenopause"
  | "postmenopause";

// Consumer-facing MM Health Score tier, 0-100, HIGHER IS BETTER.
export type RiskTierKey = "optimized" | "functional" | "declining" | "at_risk" | "critical";

// Raw-instrument clinical band, percent-of-max-score, HIGHER IS WORSE.
// Never mix with RiskTierKey in the same component/label.
export type ClinicalRiskBandKey = "minimal" | "low" | "moderate" | "high" | "critical";

export type ConvergencePatternDataStatus = "confirmed" | "pending_registry_data";

export interface Pillar {
  pillarKey: PillarKey;
  label: string;
  colorHex: string;
  iconKind: "force" | "cellular" | "wave" | "neural";
  radarLetter: string;
  radarAngleDeg: number;
  order: number;
  categoryCount: number;
  gated: boolean;
  problemFraming?: string;
  beliefNarrative?: string;
  clinicalTags: string[];
  frameworkVersion: string;
}

export interface Category {
  categoryKey: string;
  pillarKey: PillarKey;
  label: string;
  orderInPillar: number;
  globalOrder: number;
  frameworkVersion: string;
}

export interface Construct {
  constructKey: string;
  label: string;
  parentCategoryKeys: string[];
  notes?: string;
  frameworkVersion: string;
}

export interface GmmbbAxis {
  axisKey: GmmbbAxisKey;
  label: string;
  weightPercent: number;
  angleDeg: number;
  order: number;
  markers: string[];
  frameworkVersion: string;
}

export interface ModifyingFactor {
  factorKey: string;
  label: string;
  appliesToPillarKeys: PillarKey[];
  scopeNote?: string;
  frameworkVersion: string;
}

export interface PopulationOverlay {
  overlayKey: PopulationOverlayKey;
  label: string;
  elevatesCategoryKeys: string[];
  description?: string;
  requiresIntakeField?: string;
  frameworkVersion: string;
}

export interface ConvergencePattern {
  patternId: string;
  canonicalName?: string;
  deprecatedNames: string[];
  primaryHome?: string;
  description?: string;
  dataStatus: ConvergencePatternDataStatus;
  frameworkVersion: string;
}

export interface CrossCuttingNode {
  nodeKey: string;
  label: string;
  primaryHomeType?: string;
  primaryHomeKey?: string;
  bridges?: string[];
  dataStatus: ConvergencePatternDataStatus;
  frameworkVersion: string;
}

export interface RiskTier {
  tierKey: RiskTierKey;
  label: string;
  order: number;
  minScore: number;
  maxScore: number;
  colorHex: string;
  mutedColorHex: string;
  clinicalCopy: string;
  frameworkVersion: string;
}

export interface ClinicalRiskBand {
  bandKey: ClinicalRiskBandKey;
  label: string;
  order: number;
  minPercent: number;
  maxPercent: number;
  frameworkVersion: string;
}

export interface FullTaxonomy {
  frameworkVersion: {
    versionTag: string;
    alignedDate?: string;
    sourceAuthority: string;
    notes?: string;
    isCurrent: boolean;
  } | null;
  pillars: Pillar[];
  categories: Category[];
  constructs: Construct[];
  gmmbbAxes: GmmbbAxis[];
  modifyingFactors: ModifyingFactor[];
  populationOverlays: PopulationOverlay[];
  convergencePatterns: ConvergencePattern[];
  crossCuttingNodes: CrossCuttingNode[];
  riskTiers: RiskTier[];
  clinicalRiskBands: ClinicalRiskBand[];
}
