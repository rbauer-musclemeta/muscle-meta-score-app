import surveyPackage from "../config/survey-schema.json";
import pathwayMap from "../config/pathway-cta-map.json";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const packageData = surveyPackage as any;
const ctaMap = pathwayMap as any;

type CatabolicBand = "no_flag" | "watch" | "active_recovery" | "high_risk";

const CATABOLIC_LABELS: Record<CatabolicBand, string> = {
  no_flag: "No Current Catabolic Crisis Flag",
  watch: "Catabolic Stress Watch",
  active_recovery: "Active Catabolic Recovery Needed",
  high_risk: "High-Risk Catabolic Crisis Pattern"
};

const BAND_TO_PATHWAY: Record<CatabolicBand, string> = {
  no_flag: "standard_prevention",
  watch: "catabolic_watch",
  active_recovery: "active_catabolic_recovery",
  high_risk: "high_risk_catabolic_crisis"
};

const DRIVER_TO_PATHWAY: Record<string, string> = {
  illness: "post_illness_recovery",
  surgery: "post_surgery_immobilization",
  sedentary: "sedentary_deconditioned_recovery",
  weight_loss: "weight_loss_muscle_preservation",
  multiple: "complex_catabolic_recovery",
  unsure: "post_illness_recovery"
};

function bandRank(band: CatabolicBand): number {
  switch (band) {
    case "no_flag":
      return 0;
    case "watch":
      return 1;
    case "active_recovery":
      return 2;
    case "high_risk":
      return 3;
  }
}

function strongerBand(a: CatabolicBand, b: CatabolicBand): CatabolicBand {
  return bandRank(a) >= bandRank(b) ? a : b;
}

function resolveCatabolicBand(totalScore: number): CatabolicBand {
  if (totalScore <= 1) return "no_flag";
  if (totalScore <= 3) return "watch";
  if (totalScore <= 6) return "active_recovery";
  return "high_risk";
}

function toResponseMap(responses: Array<any>): Record<string, any> {
  return responses.reduce<Record<string, any>>((acc, response) => {
    acc[response.questionId] = response;
    return acc;
  }, {});
}

function getScore(responseMap: Record<string, any>, questionId: string): number {
  return Number(responseMap[questionId]?.score ?? 0);
}

function normalizePillarKey(key: string): string {
  if (key === "balance_brain") {
    // TODO: Remove alias after key naming is standardized in all configs.
    return "balance_brain_health";
  }
  return key;
}

async function upsertResult(
  ctx: any,
  submissionId: any,
  payload: {
    surveyId: any;
    userId: any;
    resultType: "catabolic" | "functional" | "combined";
    totalScore: number;
    normalizedScore?: number;
    riskBandKey: string;
    riskBandLabel: string;
    summaryTitle: string;
    summaryBody: string;
    primaryCtaKey?: string;
    secondaryCtaKey?: string;
    payload: any;
  }
) {
  const existing = await ctx.db
    .query("surveyResults")
    .withIndex("by_submissionId", (q: any) => q.eq("submissionId", submissionId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...payload,
      createdAt: Date.now()
    });
    return existing._id;
  }

  return ctx.db.insert("surveyResults", {
    submissionId,
    ...payload,
    createdAt: Date.now()
  });
}

async function createPathwayRow(
  ctx: any,
  args: {
    resultId: any;
    userId?: any;
    pathwayKey: string;
    pathwayType: "standard" | "watch" | "active_recovery" | "high_risk";
    driverKey?: string;
  }
) {
  return ctx.db.insert("userPathways", {
    resultId: args.resultId,
    userId: args.userId,
    pathwayKey: args.pathwayKey,
    pathwayLabel: args.pathwayKey,
    pathwayType: args.pathwayType,
    driverKey: args.driverKey,
    priorityRank: 1,
    createdAt: Date.now()
  });
}

export const scoreCatabolicCrisis = mutation({
  args: {
    submissionId: v.id("surveySubmissions")
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found.");
    }

    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", args.submissionId))
      .collect();

    const responseMap = toResponseMap(responses);
    const q1 = getScore(responseMap, "cc_q1_medical_event");
    const q2 = getScore(responseMap, "cc_q2_weight_appetite_muscle");
    const q3 = getScore(responseMap, "cc_q3_activity_drop");
    const driver =
      responseMap["cc_driver"]?.selectedOptionId ??
      responseMap["cc_driver"]?.selectedValue ??
      "unsure";

    const totalScore = q1 + q2 + q3;
    let band = resolveCatabolicBand(totalScore);

    if (q1 >= 3 || q2 >= 3 || q3 === 4) {
      band = strongerBand(band, "active_recovery");
    }

    if (driver === "multiple" && totalScore >= 6) {
      band = "high_risk";
    }

    const redFlags: string[] = [];
    if (q1 === 4) redFlags.push("urgent_event");
    if (q2 === 4) redFlags.push("urgent_weight_loss");
    if (q3 === 4) redFlags.push("urgent_inactivity");

    const primaryPathway = BAND_TO_PATHWAY[band];
    const driverPathway = DRIVER_TO_PATHWAY[driver] ?? "post_illness_recovery";

    const primaryCta = ctaMap.ctas[primaryPathway];

    const resultPayload = {
      surveyId: "catabolic_crisis_screen_v1",
      submissionId: args.submissionId,
      totalScore,
      riskBand: band,
      riskLabel: CATABOLIC_LABELS[band],
      primaryPathway,
      pathwayTag: driverPathway,
      redFlags,
      recommendedCta: {
        primary: primaryPathway,
        secondary: "standard_prevention"
      },
      summary:
        primaryCta?.resultSubtitle ??
        "Your responses suggest catabolic stress that should guide next steps."
    };

    const resultId = await upsertResult(ctx, args.submissionId, {
      surveyId: submission.surveyId,
      userId: submission.userId,
      resultType: "catabolic",
      totalScore,
      riskBandKey: band,
      riskBandLabel: CATABOLIC_LABELS[band],
      summaryTitle: CATABOLIC_LABELS[band],
      summaryBody: resultPayload.summary,
      primaryCtaKey: primaryPathway,
      secondaryCtaKey: "standard_prevention",
      payload: resultPayload
    });

    await createPathwayRow(ctx, {
      resultId,
      userId: submission.userId,
      pathwayKey: primaryPathway,
      pathwayType:
        band === "no_flag"
          ? "standard"
          : band === "watch"
            ? "watch"
            : band === "active_recovery"
              ? "active_recovery"
              : "high_risk",
      driverKey: driverPathway
    });

    return resultPayload;
  }
});

export const scoreFunctionalScorecard = mutation({
  args: {
    submissionId: v.id("surveySubmissions")
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found.");
    }

    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", args.submissionId))
      .collect();

    const responseMap = toResponseMap(responses);

    const functionalSurvey = packageData.surveys.find(
      (survey: any) => survey.id === "functional_decline_muscle_risk_scorecard_v1"
    );

    if (!functionalSurvey) {
      throw new Error("Functional scorecard definition missing.");
    }

    const questionScores = functionalSurvey.questions.reduce(
      (acc: Record<string, number>, question: any) => {
        acc[question.id] = getScore(responseMap, question.id);
        return acc;
      },
      {}
    );

    const categoryScores = functionalSurvey.categories.reduce(
      (acc: Record<string, number>, category: any) => {
        const questions = functionalSurvey.questions.filter(
          (question: any) => question.categoryId === category.id
        );
        acc[category.id] = questions.reduce(
          (sum: number, question: any) => sum + (questionScores[question.id] ?? 0),
          0
        );
        return acc;
      },
      {}
    );

    const pillarScores = functionalSurvey.pillars.reduce(
      (acc: Record<string, { raw: number; percent: number }>, pillar: any) => {
        const raw = pillar.categoryIds.reduce(
          (sum: number, categoryId: string) => sum + (categoryScores[categoryId] ?? 0),
          0
        );
        acc[pillar.id] = {
          raw,
          percent: Math.round((raw / pillar.max) * 100)
        };
        return acc;
      },
      {}
    );

    const totalScore = (Object.values(questionScores) as number[]).reduce(
      (sum: number, score: number) => sum + score,
      0
    );

    let totalBand = "high_risk";
    let totalLabel = "High functional decline / muscle risk";

    for (const band of functionalSurvey.scoring.totalBands) {
      if (totalScore >= band.min && totalScore <= band.max) {
        totalBand = band.id;
        totalLabel = band.label;
      }
    }

    const sortedPillars = (Object.entries(pillarScores) as Array<[string, { raw: number; percent: number }]>).sort(
      (a, b) => a[1].percent - b[1].percent
    );
    const weakestPillar = sortedPillars[0]?.[0] ?? "exercise_mobility";
    const strongestPillar =
      sortedPillars[sortedPillars.length - 1]?.[0] ?? "exercise_mobility";

    const sortedCategories = (Object.entries(categoryScores) as Array<[string, number]>).sort((a, b) => a[1] - b[1]);
    const lowestCategory = sortedCategories[0]?.[0] ?? "joint_health";
    const lowestCategoryScore = sortedCategories[0]?.[1] ?? 0;

    const topFocusAreas = sortedCategories
      .filter((entry) => entry[1] === lowestCategoryScore)
      .slice(0, 2)
      .map((entry) => entry[0]);

    const redFlags: string[] = [];
    if ((categoryScores.balance ?? 10) <= 4) redFlags.push("low_balance");
    if ((categoryScores.functional_independence ?? 10) <= 4)
      redFlags.push("low_functional_independence");
    if ((questionScores.fi_2 ?? 5) <= 2) redFlags.push("floor_transfer_concern");
    if ((questionScores.ba_2 ?? 5) <= 2) redFlags.push("stairs_confidence_concern");

    const normalizedWeakestPillar = normalizePillarKey(weakestPillar);
    const functionalPathwayKey =
      ctaMap.rules.functionalFallbackByLowestPillar[normalizedWeakestPillar] ??
      "functional_exercise_mobility";

    const resultPayload = {
      surveyId: "functional_decline_muscle_risk_scorecard_v1",
      submissionId: args.submissionId,
      totalScore,
      totalBand,
      totalLabel,
      categoryScores,
      pillarScores,
      weakestPillar,
      strongestPillar,
      lowestCategory,
      topFocusAreas,
      redFlags,
      recommendedCta: {
        primary: functionalPathwayKey,
        secondary: "functional_exercise_mobility"
      },
      summary:
        "You are showing functional weak links that should guide your starting pathway."
    };

    const resultId = await upsertResult(ctx, args.submissionId, {
      surveyId: submission.surveyId,
      userId: submission.userId,
      resultType: "functional",
      totalScore,
      normalizedScore: Math.round((totalScore / 120) * 100),
      riskBandKey: totalBand,
      riskBandLabel: totalLabel,
      summaryTitle: totalLabel,
      summaryBody: resultPayload.summary,
      primaryCtaKey: functionalPathwayKey,
      secondaryCtaKey: "functional_exercise_mobility",
      payload: resultPayload
    });

    await createPathwayRow(ctx, {
      resultId,
      userId: submission.userId,
      pathwayKey: functionalPathwayKey,
      pathwayType: "standard"
    });

    return resultPayload;
  }
});

export const getResultBySubmissionId = query({
  args: {
    submissionId: v.id("surveySubmissions"),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("surveyResults")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", args.submissionId))
      .unique();

    if (!result) {
      return null;
    }

    if (args.userId && result.userId && result.userId !== args.userId) {
      return null;
    }

    const pathways = await ctx.db
      .query("userPathways")
      .withIndex("by_resultId", (q) => q.eq("resultId", result._id))
      .collect();

    return {
      ...result,
      pathways
    };
  }
});

export const getLatestResultsForUser = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("surveyResults")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  }
});