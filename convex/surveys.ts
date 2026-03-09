import surveyPackage from "../config/survey-schema.json";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const packageData = surveyPackage as {
  version: string;
  surveys: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    responseScale?: Record<string, string>;
    questions: Array<{
      id: string;
      order: number;
      kind: "single_select";
      required: boolean;
      scored?: boolean;
      prompt: string;
      categoryId?: string;
      scoreRange?: [number, number];
      options?: Array<{
        id: string;
        label: string;
        score?: number;
      }>;
    }>;
  }>;
};

function toSurveyType(type: string): "catabolic_crisis" | "functional_scorecard" | "combined" {
  if (type === "screening") return "catabolic_crisis";
  if (type === "assessment") return "functional_scorecard";
  return "combined";
}

function buildFallbackLikertOptions(questionDef: {
  scoreRange?: [number, number];
}, responseScale?: Record<string, string>) {
  const min = questionDef.scoreRange?.[0] ?? 1;
  const max = questionDef.scoreRange?.[1] ?? 5;

  const options: Array<{ id: string; label: string; score: number }> = [];

  for (let value = min; value <= max; value += 1) {
    options.push({
      id: String(value),
      label: responseScale?.[String(value)] ?? `Score ${value}`,
      score: value
    });
  }

  return options;
}

export const listActiveSurveys = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("surveys")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  }
});

export const getSurveyBySlug = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const survey = await ctx.db
      .query("surveys")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!survey) {
      return null;
    }

    const questions = await ctx.db
      .query("surveyQuestions")
      .withIndex("by_surveyId_order", (q) => q.eq("surveyId", survey._id))
      .collect();

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await ctx.db
          .query("surveyOptions")
          .withIndex("by_questionDocId", (q) => q.eq("questionDocId", question._id))
          .collect();
        return { ...question, options };
      })
    );

    return {
      ...survey,
      questions: questionsWithOptions
    };
  }
});

export const seedSurveyContent = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    for (const surveyDef of packageData.surveys) {
      const slug = surveyDef.id.replace(/_/g, "-");
      const existingSurvey = await ctx.db
        .query("surveys")
        .withIndex("by_surveyId", (q) => q.eq("surveyId", surveyDef.id))
        .unique();

      let surveyId = existingSurvey?._id;

      if (!surveyId) {
        surveyId = await ctx.db.insert("surveys", {
          surveyId: surveyDef.id,
          slug,
          title: surveyDef.title,
          description: surveyDef.description,
          version: packageData.version,
          status: "active",
          type: toSurveyType(surveyDef.type),
          createdAt: now,
          updatedAt: now
        });
      } else {
        await ctx.db.patch(surveyId, {
          slug,
          title: surveyDef.title,
          description: surveyDef.description,
          version: packageData.version,
          status: "active",
          type: toSurveyType(surveyDef.type),
          updatedAt: now
        });
      }

      for (const questionDef of surveyDef.questions) {
        const existingQuestion = await ctx.db
          .query("surveyQuestions")
          .withIndex("by_survey_questionId", (q) =>
            q.eq("surveyId", surveyId).eq("questionId", questionDef.id)
          )
          .unique();

        let questionDocId = existingQuestion?._id;

        if (!questionDocId) {
          questionDocId = await ctx.db.insert("surveyQuestions", {
            surveyId,
            questionId: questionDef.id,
            order: questionDef.order,
            type: questionDef.kind,
            text: questionDef.prompt,
            isRequired: questionDef.required,
            isScored: questionDef.scored ?? true,
            scoreDomain:
              surveyDef.id === "catabolic_crisis_screen_v1"
                ? "catabolic"
                : "functional",
            categoryKey: questionDef.categoryId,
            createdAt: now,
            updatedAt: now
          });
        } else {
          await ctx.db.patch(questionDocId, {
            order: questionDef.order,
            type: questionDef.kind,
            text: questionDef.prompt,
            isRequired: questionDef.required,
            isScored: questionDef.scored ?? true,
            categoryKey: questionDef.categoryId,
            updatedAt: now
          });
        }

        const optionList =
          questionDef.options && questionDef.options.length > 0
            ? questionDef.options
            : buildFallbackLikertOptions(questionDef, surveyDef.responseScale);

        for (let index = 0; index < optionList.length; index += 1) {
          const optionDef = optionList[index];
          const existingOption = await ctx.db
            .query("surveyOptions")
            .withIndex("by_question_optionId", (q) =>
              q.eq("questionDocId", questionDocId).eq("optionId", optionDef.id)
            )
            .unique();

          if (!existingOption) {
            await ctx.db.insert("surveyOptions", {
              questionDocId,
              optionId: optionDef.id,
              label: optionDef.label,
              value: optionDef.id,
              score: optionDef.score,
              order: index + 1
            });
          } else {
            await ctx.db.patch(existingOption._id, {
              label: optionDef.label,
              value: optionDef.id,
              score: optionDef.score,
              order: index + 1
            });
          }
        }
      }
    }

    return { ok: true };
  }
});