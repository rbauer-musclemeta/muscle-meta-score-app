import { getSurveyById } from "@/content/surveys/surveySchema";
import { getSelectedScore } from "@/lib/utils/survey";
import type { CatabolicResult } from "@/types/results";
import type { QuestionAnswerMap } from "@/types/shared";

function resolveRiskBand(totalScore: number): CatabolicResult["riskBand"] {
  if (totalScore <= 1) return "no_flag";
  if (totalScore <= 3) return "watch";
  if (totalScore <= 6) return "active_recovery";
  return "high_risk";
}

function bandRank(band: CatabolicResult["riskBand"]): number {
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

function maxBand(
  a: CatabolicResult["riskBand"],
  b: CatabolicResult["riskBand"]
): CatabolicResult["riskBand"] {
  return bandRank(a) > bandRank(b) ? a : b;
}

const RISK_LABELS: Record<CatabolicResult["riskBand"], string> = {
  no_flag: "No Current Catabolic Crisis Flag",
  watch: "Catabolic Stress Watch",
  active_recovery: "Active Catabolic Recovery Needed",
  high_risk: "High-Risk Catabolic Crisis Pattern"
};

const DRIVER_TO_PATHWAY: Record<string, string> = {
  illness: "post_illness_recovery",
  surgery: "post_surgery_immobilization",
  sedentary: "sedentary_deconditioned_recovery",
  weight_loss: "weight_loss_muscle_preservation",
  multiple: "complex_catabolic_recovery",
  unsure: "post_illness_recovery"
};

const BAND_TO_PRIMARY_PATHWAY: Record<CatabolicResult["riskBand"], string> = {
  no_flag: "standard_prevention",
  watch: "catabolic_watch",
  active_recovery: "active_catabolic_recovery",
  high_risk: "high_risk_catabolic_crisis"
};

export function scoreCatabolicClientPreview(
  answers: QuestionAnswerMap
): CatabolicResult {
  // TODO: Replace this client preview helper with Convex result calls.
  const survey = getSurveyById("catabolic_crisis_screen_v1");

  const q1 = getSelectedScore(
    survey.questions.find((q) => q.id === "cc_q1_medical_event")!,
    answers.cc_q1_medical_event
  );
  const q2 = getSelectedScore(
    survey.questions.find((q) => q.id === "cc_q2_weight_appetite_muscle")!,
    answers.cc_q2_weight_appetite_muscle
  );
  const q3 = getSelectedScore(
    survey.questions.find((q) => q.id === "cc_q3_activity_drop")!,
    answers.cc_q3_activity_drop
  );

  const totalScore = q1 + q2 + q3;
  let riskBand = resolveRiskBand(totalScore);

  if (q1 >= 3 || q2 >= 3 || q3 === 4) {
    riskBand = maxBand(riskBand, "active_recovery");
  }

  if (answers.cc_driver === "multiple" && totalScore >= 6) {
    riskBand = "high_risk";
  }

  const redFlags: string[] = [];
  if (q1 === 4) redFlags.push("urgent_event");
  if (q2 === 4) redFlags.push("urgent_weight_loss");
  if (q3 === 4) redFlags.push("urgent_inactivity");

  const primaryPathway = BAND_TO_PRIMARY_PATHWAY[riskBand];
  const pathwayTag = DRIVER_TO_PATHWAY[answers.cc_driver] ?? "post_illness_recovery";

  return {
    surveyId: "catabolic_crisis_screen_v1",
    totalScore,
    riskBand,
    riskLabel: RISK_LABELS[riskBand],
    primaryPathway,
    pathwayTag,
    redFlags,
    recommendedCta: {
      primary: primaryPathway,
      secondary: "standard_prevention"
    },
    summary:
      riskBand === "no_flag"
        ? "No strong current catabolic crisis signal was detected."
        : "Your answers suggest catabolic stress that should guide your next pathway."
  };
}
