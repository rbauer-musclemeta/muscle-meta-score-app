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
    .index("by_pathwayKey", ["pathwayKey"])
});