# Data Model

## Goal
This data model supports a secure assessment-driven app that stores:
- users
- survey definitions
- response options
- submissions
- calculated results
- pathway assignments
- reassessment history

The model is designed for Convex and assumes the frontend is a Netlify-hosted React/Vite PWA.

## Core Design Principles
- survey content should be editable without rewriting core logic
- scoring should be stored and reproducible
- pathway routing should be explicit and auditable
- reassessments should be linked to prior submissions
- user data should be protected and separated from public content

## Core Collections

### `users`
Stores authenticated user records.

Suggested fields:
- `_id`
- `clerkUserId`
- `email`
- `firstName`
- `lastName`
- `createdAt`
- `updatedAt`
- `status`

Optional fields:
- `ageRange`
- `gender`
- `goals`
- `consentAccepted`
- `marketingOptIn`

## `surveys`
Stores survey definitions.

Examples:
- Catabolic Crisis Screen
- Functional Decline & Muscle Risk Scorecard
- Reassessment survey

Suggested fields:
- `_id`
- `slug`
- `title`
- `description`
- `version`
- `status`
- `surveyType`
- `isActive`
- `createdAt`
- `updatedAt`

Example values for `surveyType`:
- `screening`
- `scorecard`
- `reassessment`

## `surveyQuestions`
Stores individual questions linked to a survey.

Suggested fields:
- `_id`
- `surveyId`
- `questionKey`
- `order`
- `step`
- `prompt`
- `helpText`
- `questionType`
- `isRequired`
- `scored`
- `category`
- `pillar`
- `createdAt`
- `updatedAt`

Example values for `questionType`:
- `single_select`
- `multi_select`
- `numeric`
- `text`

For the Catabolic Crisis Screen, questions may not need full pillar mapping, but the broader Functional Decline Scorecard does.

## `surveyOptions`
Stores answer options for each question.

Suggested fields:
- `_id`
- `surveyQuestionId`
- `optionKey`
- `label`
- `description`
- `scoreValue`
- `routeTag`
- `order`
- `createdAt`
- `updatedAt`

Examples:
- answer text for each multiple-choice option
- numeric score associated with that option
- optional route tag for dominant driver logic

## `surveySubmissions`
Stores one completed or in-progress survey attempt.

Suggested fields:
- `_id`
- `surveyId`
- `userId`
- `status`
- `startedAt`
- `completedAt`
- `source`
- `sessionId`
- `version`

Example values for `status`:
- `in_progress`
- `completed`
- `abandoned`

Example values for `source`:
- `public_site`
- `app_dashboard`
- `reassessment_prompt`

## `surveyResponses`
Stores per-question responses linked to a submission.

Suggested fields:
- `_id`
- `submissionId`
- `surveyQuestionId`
- `selectedOptionId`
- `selectedOptionKey`
- `rawValue`
- `scoreValue`
- `createdAt`

This collection allows detailed review and recalculation if logic changes later.

## `surveyResults`
Stores computed assessment results.

Suggested fields:
- `_id`
- `submissionId`
- `userId`
- `surveyId`
- `totalScore`
- `riskBand`
- `resultLabel`
- `summary`
- `weakestPillar`
- `strongestPillar`
- `primaryPathwayId`
- `secondaryPathwayId`
- `overrideFlags`
- `resultVersion`
- `createdAt`

For the Catabolic Crisis Screen, this is where the app stores:
- crisis score
- crisis risk band
- pathway assignment
- any red-flag overrides

## `categoryScores`
Stores calculated scores by category for a given result.

Suggested fields:
- `_id`
- `resultId`
- `categoryKey`
- `rawScore`
- `normalizedScore`
- `riskLevel`

This is most useful for the broader Functional Decline & Muscle Risk Scorecard.

## `pillarScores`
Stores calculated pillar-level scores for a given result.

Suggested fields:
- `_id`
- `resultId`
- `pillarKey`
- `rawScore`
- `maxScore`
- `normalizedPercent`
- `riskLevel`

## `pathways`
Stores pathway definitions.

Examples:
- Standard Prevention Pathway
- Catabolic Watch Pathway
- Active Catabolic Recovery Pathway
- High-Risk Catabolic Crisis Pathway
- Post-Illness Recovery Pathway
- Post-Surgery / Immobilization Pathway
- Sedentary / Deconditioned Recovery Pathway
- Weight Loss / Muscle Preservation Pathway

Suggested fields:
- `_id`
- `slug`
- `title`
- `description`
- `focusSummary`
- `ctaLabel`
- `status`
- `createdAt`
- `updatedAt`

## `userPathways`
Stores a user’s current or historical pathway assignments.

Suggested fields:
- `_id`
- `userId`
- `pathwayId`
- `sourceResultId`
- `status`
- `assignedAt`
- `endedAt`

Example values for `status`:
- `active`
- `completed`
- `archived`

## `reassessments`
Stores reassessment events over time.

Suggested fields:
- `_id`
- `userId`
- `surveyId`
- `previousResultId`
- `currentResultId`
- `changeSummary`
- `scheduledAt`
- `completedAt`
- `createdAt`

This enables progress tracking and longitudinal insights.

## `reports`
Stores generated personalized reports or report metadata.

Suggested fields:
- `_id`
- `userId`
- `resultId`
- `reportType`
- `title`
- `storageUrl`
- `createdAt`

Examples:
- initial results summary
- catabolic crisis recovery plan
- 30-day reassessment report

## Relationships Summary

### One-to-many relationships
- one `survey` has many `surveyQuestions`
- one `surveyQuestion` has many `surveyOptions`
- one `user` has many `surveySubmissions`
- one `surveySubmission` has many `surveyResponses`
- one `surveySubmission` has one primary `surveyResult`
- one `surveyResult` has many `categoryScores`
- one `surveyResult` has many `pillarScores`
- one `user` has many `userPathways`
- one `user` has many `reassessments`

## Minimal Version 1 Model
If you want to launch a simpler version first, start with:
- `users`
- `surveys`
- `surveyQuestions`
- `surveyOptions`
- `surveySubmissions`
- `surveyResponses`
- `surveyResults`
- `pathways`

Add later:
- `categoryScores`
- `pillarScores`
- `userPathways`
- `reassessments`
- `reports`

## Catabolic Crisis Example Mapping

### Survey
`catabolic_crisis_screen_v1`

### Questions
- recent medical event
- weight loss or appetite decline
- activity collapse
- optional dominant driver

### Stored result fields
- `totalScore`
- `riskBand`
- `resultLabel`
- `primaryPathwayId`
- `overrideFlags`

### Example override flags
- `major_medical_event`
- `significant_weight_loss`
- `severe_inactivity`
- `multiple_driver_pattern`

## Functional Decline Scorecard Example Mapping

### Survey
`functional_decline_muscle_risk_scorecard_v1`

### Stored results
- total score
- category scores
- pillar scores
- strongest pillar
- weakest pillar
- recommended starting point

## Content vs Logic Separation
Keep these in editable content structures:
- question prompts
- answer labels
- support text
- results copy
- pathway descriptions

Keep these in backend logic:
- score calculations
- normalization
- override rules
- route assignment
- red-flag detection

## Example Convex Logic Responsibilities
### Queries
- get survey by slug
- get questions for survey
- get user latest result
- get user pathway history

### Mutations
- create submission
- save response
- complete submission
- store result
- assign pathway

### Internal actions or helpers
- calculate total score
- apply overrides
- compute pillar normalization
- generate summary labels

## Privacy Considerations
This app may store user-submitted health-related information, even if it is educational in nature.

Recommended safeguards:
- collect only what is needed
- store private user data in Convex, not spreadsheets
- protect access through authentication
- clearly separate public content from personalized data
- include educational disclaimers in the user interface

## Final Recommendation
Design the data model to support:
- flexible survey definitions
- reproducible scoring
- pathway routing
- saved progress over time

This ensures the Muscle-Meta app can start with a focused assessment experience and expand into a deeper dashboard, content, and reassessment system without a major rebuild.
