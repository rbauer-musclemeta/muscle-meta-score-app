import type { SurveyQuestion } from "@/types/survey";

export function getSelectedScore(
  question: SurveyQuestion,
  selectedOptionId: string | undefined
): number {
  if (!selectedOptionId) {
    return 0;
  }

  const option = question.options.find((item) => item.id === selectedOptionId);
  return option?.score ?? 0;
}

export function createLocalSubmissionId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}
