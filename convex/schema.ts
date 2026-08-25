import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    externalAuthId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    ageRange: v.optional(v.string()),
    marketingOptIn: v.boolean(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_externalAuthId", ["externalAuthId"])
    .index("by_email", ["email"]),

  surveys: defineTable({
    surveyId: v.string(),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    version: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    type: v.union(
      v.literal("catabolic_crisis"),
      v.literal("functional_scorecard"),
      v.literal("combined")
    ),
    introCopy: v.optional(v.string()),
    resultDisclaimer: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_slug", ["slug"])
    .index("by_surveyId", ["surveyId"])
    .index("by_status", ["status"]),

  surveyQuestions: defineTable({
    surveyId: v.id("surveys"),
    questionId: v.string(),
    sectionId: v.optional(v.string()),
    order: v.number(),
    text: v.string(),
    helpText: v.optional(v.string()),
    type: v.union(
      v.literal("single_select"),
      v.literal("multi_select"),
      v.literal("number"),
      v.literal("text")
    ),
    isRequired: v.boolean(),
    isScored: v.boolean(),
    scoreDomain: v.optional(
      v.union(v.literal("catabolic"), v.literal("functional"))
    ),
    categoryKey: v.optional(v.string()),
    pillarKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_surveyId", ["surveyId"])
    .index("by_questionId", ["questionId"])
    .index("by_surveyId_order", ["surveyId", "order"])
    .index("by_survey_questionId", ["surveyId", "questionId"]),

  surveyOptions: defineTable({
    questionDocId: v.id("surveyQuestions"),
    optionId: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    value: v.string(),
    score: v.optional(v.number()),
    order: v.number(),
    pathwayHint: v.optional(v.string())
  })
    .index("by_questionDocId", ["questionDocId"])
    .index("by_question_optionId", ["questionDocId", "optionId"]),

  surveySubmissions: defineTable({
    userId: v.optional(v.id("users")),
    surveyId: v.id("surveys"),
    submissionStatus: v.union(
      v.literal("started"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    entrySource: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    ipHash: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    appVersion: v.optional(v.string())
  })
    .index("by_surveyId", ["surveyId"])
    .index("by_userId", ["userId"])
    .index("by_user_completedAt", ["userId", "completedAt"]),

  surveyResponses: defineTable({
    submissionId: v.id("surveySubmissions"),
    questionDocId: v.id("surveyQuestions"),
    questionId: v.string(),
    selectedOptionId: v.optional(v.string()),
    selectedValue: v.optional(v.union(v.string(), v.number())),
    selectedLabel: v.optional(v.string()),
    score: v.optional(v.number()),
    createdAt: v.number()
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_submission_question", ["submissionId", "questionId"]),

  surveyResults: defineTable({
    submissionId: v.id("surveySubmissions"),
    surveyId: v.id("surveys"),
    userId: v.optional(v.id("users")),
    resultType: v.union(v.literal("catabolic"), v.literal("functional"), v.literal("combined")),
    totalScore: v.number(),
    normalizedScore: v.optional(v.number()),
    riskBandKey: v.string(),
    riskBandLabel: v.string(),
    summaryTitle: v.string(),
    summaryBody: v.string(),
    primaryCtaKey: v.optional(v.string()),
    secondaryCtaKey: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number()
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_userId", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_survey_createdAt", ["surveyId", "createdAt"]),

  userPathways: defineTable({
    resultId: v.id("surveyResults"),
    userId: v.optional(v.id("users")),
    pathwayKey: v.string(),
    pathwayLabel: v.string(),
    pathwayType: v.union(
      v.literal("standard"),
      v.literal("watch"),
      v.literal("active_recovery"),
      v.literal("high_risk")
    ),
    driverKey: v.optional(v.string()),
    priorityRank: v.number(),
    createdAt: v.number()
  })
    .index("by_resultId", ["resultId"])
    .index("by_userId", ["userId"])
    .index("by_pathwayKey", ["pathwayKey"]),

  // ---------------------------------------------------------------------
  // Framework Reference Layer (Step 1)
  //
  // These tables encode the Muscle-Meta Matrix (MM) 4-Pillar x 12-Category
  // framework, the GMMBB axis, modifying factors, population overlays,
  // convergence patterns, and the two independent risk-scale systems as
  // versioned, queryable DATA rather than constants scattered across
  // frontend/backend code. They are seeded via `seedFrameworkTaxonomy`
  // (see convex/seedFramework.ts) and are content tables, not user data:
  // nothing here is written by end-user actions.
  //
  // Source of truth: 01-canonical/FRAMEWORK.md (see frameworkVersions.versionTag).
  // If this schema and that document ever disagree, the document wins and
  // this schema is the bug.
  // ---------------------------------------------------------------------

  frameworkVersions: defineTable({
    versionTag: v.string(),
    alignedDate: v.optional(v.string()),
    sourceAuthority: v.string(),
    notes: v.optional(v.string()),
    isCurrent: v.boolean(),
    createdAt: v.number()
  })
    .index("by_versionTag", ["versionTag"])
    .index("by_isCurrent", ["isCurrent"]),

  // 4 pillars. Radar is scored and rendered at PILLAR level; category counts
  // are asymmetric by design (5-2-3-2) and must never be divided evenly.
  pillars: defineTable({
    pillarKey: v.union(
      v.literal("exercise_mobility"),
      v.literal("nutrition_metabolism"),
      v.literal("recovery_stress"),
      v.literal("balance_brain_health")
    ),
    label: v.string(),
    colorHex: v.string(),
    iconKind: v.union(
      v.literal("force"),
      v.literal("cellular"),
      v.literal("wave"),
      v.literal("neural")
    ),
    radarLetter: v.string(),
    radarAngleDeg: v.number(),
    order: v.number(),
    categoryCount: v.number(),
    gated: v.boolean(),
    problemFraming: v.optional(v.string()),
    beliefNarrative: v.optional(v.string()),
    clinicalTags: v.array(v.string()),
    frameworkVersion: v.string()
  })
    .index("by_pillarKey", ["pillarKey"])
    .index("by_order", ["order"]),

  // 12 categories total across the 4 pillars (5-2-3-2). categoryKey is a
  // plain string (not a closed union) so it composes with the existing
  // surveyQuestions.categoryKey field without a type mismatch.
  categories: defineTable({
    categoryKey: v.string(),
    pillarKey: v.string(),
    label: v.string(),
    orderInPillar: v.number(),
    globalOrder: v.number(),
    frameworkVersion: v.string()
  })
    .index("by_categoryKey", ["categoryKey"])
    .index("by_pillarKey", ["pillarKey"])
    .index("by_pillarKey_orderInPillar", ["pillarKey", "orderInPillar"]),

  // Measurement constructs scored INSIDE a category, never rendered as a
  // standalone category label (e.g. Bone Density lives inside Balance).
  // parentCategoryKeys is an array because one construct (Strength &
  // Endurance) splits across two categories in Pillar 1.
  constructs: defineTable({
    constructKey: v.string(),
    label: v.string(),
    parentCategoryKeys: v.array(v.string()),
    notes: v.optional(v.string()),
    frameworkVersion: v.string()
  }).index("by_constructKey", ["constructKey"]),

  // GMMBB is the diagnostic lens (5-axis pentagon); the pillars are the
  // intervention lens (4-axis radar). Canonical order is Gut-Muscle-
  // Metabolic-Bone-Brain -- the acronym itself.
  gmmbbAxes: defineTable({
    axisKey: v.union(
      v.literal("gut"),
      v.literal("muscle"),
      v.literal("metabolic"),
      v.literal("bone"),
      v.literal("brain")
    ),
    label: v.string(),
    weightPercent: v.number(),
    angleDeg: v.number(),
    order: v.number(),
    markers: v.array(v.string()),
    frameworkVersion: v.string()
  })
    .index("by_axisKey", ["axisKey"])
    .index("by_order", ["order"]),

  // Modifying factors influence category scores. They are never displayed
  // as additional pillars.
  modifyingFactors: defineTable({
    factorKey: v.string(),
    label: v.string(),
    appliesToPillarKeys: v.array(v.string()),
    scopeNote: v.optional(v.string()),
    frameworkVersion: v.string()
  }).index("by_factorKey", ["factorKey"]),

  // Population overlays RE-WEIGHT category priority. They never add
  // pillars or categories, and they stack (a perimenopausal pickleball
  // player on a GLP-1 can have three active at once).
  populationOverlays: defineTable({
    overlayKey: v.union(
      v.literal("pickleball"),
      v.literal("osteoporosis"),
      v.literal("glp1"),
      v.literal("post_hospital"),
      v.literal("perimenopause"),
      v.literal("postmenopause")
    ),
    label: v.string(),
    elevatesCategoryKeys: v.array(v.string()),
    description: v.optional(v.string()),
    requiresIntakeField: v.optional(v.string()),
    frameworkVersion: v.string()
  }).index("by_overlayKey", ["overlayKey"]),

  // Convergence patterns are co-occurrence signatures (distinct from a
  // "node", which is a single thing). Full trigger logic lives in the
  // canonical 01-canonical/CONVERGENCE-PATTERNS.md registry and must not
  // be duplicated/invented here -- patterns without confirmed source data
  // are seeded with dataStatus "pending_registry_data" and no name.
  convergencePatterns: defineTable({
    patternId: v.string(),
    canonicalName: v.optional(v.string()),
    deprecatedNames: v.array(v.string()),
    primaryHome: v.optional(v.string()),
    description: v.optional(v.string()),
    dataStatus: v.union(v.literal("confirmed"), v.literal("pending_registry_data")),
    frameworkVersion: v.string()
  })
    .index("by_patternId", ["patternId"])
    .index("by_dataStatus", ["dataStatus"]),

  // Cross-cutting nodes route/cross-reference across pillars and axes but
  // never add a score. Full registry lives in
  // 01-canonical/CROSS-CUTTING-NODES.md, which is not yet available to
  // this build -- table is defined now so the schema doesn't need another
  // migration once that source data lands, but is seeded empty.
  crossCuttingNodes: defineTable({
    nodeKey: v.string(),
    label: v.string(),
    primaryHomeType: v.optional(v.string()),
    primaryHomeKey: v.optional(v.string()),
    bridges: v.optional(v.array(v.string())),
    dataStatus: v.union(v.literal("confirmed"), v.literal("pending_registry_data")),
    frameworkVersion: v.string()
  }).index("by_nodeKey", ["nodeKey"]),

  // MM Health Score: consumer-facing, 0-100, HIGHER IS BETTER. This is a
  // separate scale from clinicalRiskBands below and the two must never
  // share a label or interface -- a raw CCRAF-style score is never shown
  // to a consumer under this tier system.
  riskTiers: defineTable({
    tierKey: v.union(
      v.literal("optimized"),
      v.literal("functional"),
      v.literal("declining"),
      v.literal("at_risk"),
      v.literal("critical")
    ),
    label: v.string(),
    order: v.number(),
    minScore: v.number(),
    maxScore: v.number(),
    colorHex: v.string(),
    mutedColorHex: v.string(),
    clinicalCopy: v.string(),
    frameworkVersion: v.string()
  })
    .index("by_tierKey", ["tierKey"])
    .index("by_order", ["order"]),

  // Generic raw-instrument risk stratification, HIGHER IS WORSE, expressed
  // as a percent-of-max-score band. Used by non-consumer-facing / clinical
  // assessment types (e.g. CCRAF) -- see assessmentTypes.scoringDirection
  // in Step 2. Deliberately a separate table/shape from riskTiers so the
  // two scales cannot be accidentally merged in a query or a component.
  clinicalRiskBands: defineTable({
    bandKey: v.union(
      v.literal("minimal"),
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.literal("critical")
    ),
    label: v.string(),
    order: v.number(),
    minPercent: v.number(),
    maxPercent: v.number(),
    frameworkVersion: v.string()
  })
    .index("by_bandKey", ["bandKey"])
    .index("by_order", ["order"])
});