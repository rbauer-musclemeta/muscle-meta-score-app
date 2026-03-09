import surveyPackage from "../../../config/survey-schema.json";
import type { SurveyDefinition, SurveyPackage, SurveyQuestion } from "@/types/survey";

const typedPackage = surveyPackage as SurveyPackage;

function buildDefaultLikertOptions(
  question: SurveyQuestion,
  responseScale?: Record<string, string>
) {
  const min = question.scoreRange?.[0] ?? 1;
  const max = question.scoreRange?.[1] ?? 5;

  const options = [] as Array<{ id: string; label: string; score: number }>;

  for (let value = min; value <= max; value += 1) {
    options.push({
      id: String(value),
      label: responseScale?.[String(value)] ?? `Score ${value}`,
      score: value
    });
  }

  return options;
}

function normalizeSurvey(survey: SurveyDefinition): SurveyDefinition {
  return {
    ...survey,
    questions: survey.questions.map((question) => ({
      ...question,
      options:
        question.options && question.options.length > 0
          ? question.options
          : buildDefaultLikertOptions(question, survey.responseScale)
    }))
  };
}

export function getSurveyById(surveyId: string): SurveyDefinition {
  const survey = typedPackage.surveys.find((item) => item.id === surveyId);
  if (!survey) {
    throw new Error(`Survey not found: ${surveyId}`);
  }
  return normalizeSurvey(survey);
}

export function listSurveys(): SurveyDefinition[] {
  return typedPackage.surveys.map(normalizeSurvey);
}

export { typedPackage as surveyPackage };