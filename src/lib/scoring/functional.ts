import { getSurveyById } from "@/content/surveys/surveySchema";
import { getFunctionalFallbackCtaKey } from "@/lib/routing/pathwayCta";
import { getSelectedScore } from "@/lib/utils/survey";
import type { FunctionalResult } from "@/types/results";
import type { QuestionAnswerMap } from "@/types/shared";

const TOTAL_BANDS: Array<{
  id: FunctionalResult["totalBand"];
  min: number;
  max: number;
  label: string;
}> = [
  { id: "resilient", min: 103, max: 120, label: "Resilient / low current concern" },
  {
    id: "stable_weak_links",
    min: 85,
    max: 102,
    label: "Stable but showing early weak links"
  },
  {
    id: "early_pattern",
    min: 66,
    max: 84,
    label: "Early functional decline pattern"
  },
  {
    id: "moderate_risk",
    min: 47,
    max: 65,
    label: "Moderate muscle/function risk"
  },
  {
    id: "high_risk",
    min: 24,
    max: 46,
    label: "High functional decline / muscle risk"
  }
];

function resolveTotalBand(totalScore: number) {
  return (
    TOTAL_BANDS.find((band) => totalScore >= band.min && totalScore <= band.max) ??
    TOTAL_BANDS[TOTAL_BANDS.length - 1]
  );
}

export function scoreFunctionalClientPreview(
  answers: QuestionAnswerMap
): FunctionalResult {
  // TODO: Replace this client preview helper with Convex result calls.
  const survey = getSurveyById("functional_decline_muscle_risk_scorecard_v1");

  const questionScores = survey.questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.id] = getSelectedScore(question, answers[question.id]);
    return acc;
  }, {});

  const categoryScores = (survey.categories ?? []).reduce<Record<string, number>>(
    (acc, category) => {
      const categoryQuestions = survey.questions.filter(
        (question) => question.categoryId === category.id
      );
      acc[category.id] = categoryQuestions.reduce(
        (sum, question) => sum + (questionScores[question.id] ?? 0),
        0
      );
      return acc;
    },
    {}
  );

  const pillarScores = (survey.pillars ?? []).reduce<
    Record<string, { raw: number; percent: number }>
  >((acc, pillar) => {
    const raw = pillar.categoryIds.reduce(
      (sum, categoryId) => sum + (categoryScores[categoryId] ?? 0),
      0
    );
    acc[pillar.id] = {
      raw,
      percent: Math.round((raw / pillar.max) * 100)
    };
    return acc;
  }, {});

  const totalScore = Object.values(questionScores).reduce((sum, score) => sum + score, 0);
  const totalBand = resolveTotalBand(totalScore);

  const sortedPillars = Object.entries(pillarScores).sort((a, b) => a[1].percent - b[1].percent);
  const weakestPillar = sortedPillars[0]?.[0] ?? "exercise_mobility";
  const strongestPillar =
    sortedPillars[sortedPillars.length - 1]?.[0] ?? "exercise_mobility";

  const sortedCategories = Object.entries(categoryScores).sort((a, b) => a[1] - b[1]);
  const lowestCategory = sortedCategories[0]?.[0] ?? "joint_health";
  const lowScore = sortedCategories[0]?.[1] ?? 0;
  const topFocusAreas = sortedCategories
    .filter((entry) => entry[1] === lowScore)
    .slice(0, 2)
    .map((entry) => entry[0]);

  const redFlags: string[] = [];
  if ((categoryScores.balance ?? 10) <= 4) redFlags.push("low_balance");
  if ((categoryScores.functional_independence ?? 10) <= 4)
    redFlags.push("low_functional_independence");
  if ((questionScores.fi_2 ?? 5) <= 2) redFlags.push("floor_transfer_concern");
  if ((questionScores.ba_2 ?? 5) <= 2) redFlags.push("stairs_confidence_concern");

  const primaryCta = getFunctionalFallbackCtaKey(weakestPillar);

  return {
    surveyId: "functional_decline_muscle_risk_scorecard_v1",
    totalScore,
    totalBand: totalBand.id,
    totalLabel: totalBand.label,
    categoryScores,
    pillarScores,
    weakestPillar,
    strongestPillar,
    lowestCategory,
    topFocusAreas,
    redFlags,
    recommendedCta: {
      primary: primaryCta,
      secondary: "functional_exercise_mobility"
    },
    summary:
      "Your score highlights priority areas to stabilize function and muscle resilience."
  };
}
