import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const startSubmission = mutation({
  args: {
    surveySlug: v.string(),
    userId: v.optional(v.id("users")),
    entrySource: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    appVersion: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const survey = await ctx.db
      .query("surveys")
      .withIndex("by_slug", (q) => q.eq("slug", args.surveySlug))
      .unique();

    if (!survey) {
      throw new Error(`Survey not found: ${args.surveySlug}`);
    }

    const startedAt = Date.now();

    const submissionId = await ctx.db.insert("surveySubmissions", {
      userId: args.userId,
      surveyId: survey._id,
      submissionStatus: "started",
      entrySource: args.entrySource,
      startedAt,
      deviceType: args.deviceType,
      appVersion: args.appVersion
    });

    return {
      submissionId,
      surveyId: survey._id,
      startedAt
    };
  }
});

export const saveResponse = mutation({
  args: {
    submissionId: v.id("surveySubmissions"),
    questionId: v.string(),
    selectedOptionId: v.optional(v.string()),
    selectedValue: v.optional(v.union(v.string(), v.number())),
    selectedLabel: v.optional(v.string()),
    score: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found.");
    }

    const question = await ctx.db
      .query("surveyQuestions")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .unique();

    if (!question) {
      throw new Error(`Question not found: ${args.questionId}`);
    }

    let resolvedScore = args.score;

    if (resolvedScore == null && args.selectedOptionId) {
      const option = await ctx.db
        .query("surveyOptions")
        .withIndex("by_question_optionId", (q) =>
          q.eq("questionDocId", question._id).eq("optionId", args.selectedOptionId!)
        )
        .unique();
      resolvedScore = option?.score;
    }

    const existingResponse = await ctx.db
      .query("surveyResponses")
      .withIndex("by_submission_question", (q) =>
        q.eq("submissionId", args.submissionId).eq("questionId", args.questionId)
      )
      .unique();

    const payload = {
      submissionId: args.submissionId,
      questionDocId: question._id,
      questionId: args.questionId,
      selectedOptionId: args.selectedOptionId,
      selectedValue: args.selectedValue,
      selectedLabel: args.selectedLabel,
      score: resolvedScore,
      createdAt: Date.now()
    };

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, payload);
      return { ok: true, responseId: existingResponse._id };
    }

    const responseId = await ctx.db.insert("surveyResponses", payload);
    return { ok: true, responseId };
  }
});

export const completeSubmission = mutation({
  args: {
    submissionId: v.id("surveySubmissions")
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found.");
    }

    const completedAt = Date.now();

    await ctx.db.patch(args.submissionId, {
      submissionStatus: "completed",
      completedAt
    });

    return {
      submissionId: args.submissionId,
      completedAt,
      status: "completed"
    };
  }
});