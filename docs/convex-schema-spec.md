# Convex Schema Spec

## Purpose
Define the initial Convex collections for the Muscle-Meta assessment app, including:
- survey definitions
- survey questions and options
- user submissions
- scored results
- pathway assignments
- reassessments
- optional report snapshots

This spec is designed to support:
- Catabolic Crisis Screen
- Functional Decline & Muscle Risk Scorecard
- future pillar-based assessments
- personalized pathway routing
- saved progress over time

---

## Recommended collection list

### `users`
Stores app user identity and profile metadata.

#### Fields
- `_id`: Convex document id
- `externalAuthId`: string
- `email`: string
- `firstName`: string | null
- `lastName`: string | null
- `ageRange`: string | null
- `createdAt`: number
- `updatedAt`: number
- `marketingOptIn`: boolean
- `status`: `"active"` | `"inactive"`

#### Notes
- `externalAuthId` should map to Clerk user id if Clerk is used.
- Do not store more health detail here than needed.

---

### `surveys`
Stores survey definitions and version metadata.

#### Fields
- `_id`
- `slug`: string
- `title`: string
- `description`: string
- `version`: string
- `status`: `"draft"` | `"active"` | `"archived"`
- `type`: `"catabolic_crisis"` | `"functional_scorecard"` | `"combined"`
- `introCopy`: string
- `resultDisclaimer`: string
- `createdAt`: number
- `updatedAt`: number

#### Example slugs
- `catabolic-crisis-screen-v1`
- `functional-decline-muscle-risk-scorecard-v1`

---

### `surveyQuestions`
Stores all questions for a survey.

#### Fields
- `_id`
- `surveyId`: Id<"surveys">
- `questionId`: string
- `sectionId`: string
- `order`: number
- `text`: string
- `helpText`: string | null
- `type`: `"single_select"` | `"multi_select"` | `"number"` | `"text"`
- `isRequired`: boolean
- `isScored`: boolean
- `scoreDomain`: `"catabolic"` | `"functional"` | null
- `categoryKey`: string | null
- `pillarKey`: string | null
- `createdAt`: number
- `updatedAt`: number

#### Notes
- `categoryKey` is used mainly for the functional scorecard.
- `pillarKey` can be null if derived later from category mapping.

---

### `surveyOptions`
Stores selectable answers for questions.

#### Fields
- `_id`
- `questionDocId`: Id<"surveyQuestions">
- `optionId`: string
- `label`: string
- `description`: string | null
- `value`: string
- `score`: number | null
- `order`: number
- `pathwayHint`: string | null

#### Notes
- `pathwayHint` is useful for the catabolic driver question.
- For non-scored questions, `score` can be null.

---

### `surveySubmissions`
Stores one submission record per survey completion attempt.

#### Fields
- `_id`
- `userId`: Id<"users"> | null
- `surveyId`: Id<"surveys">
- `submissionStatus`: `"started"` | `"completed"` | `"abandoned"`
- `entrySource`: string | null
- `startedAt`: number
- `completedAt`: number | null
- `ipHash`: string | null
- `deviceType`: string | null
- `appVersion`: string | null

#### Notes
- Allow `userId` to be null for pre-email anonymous starts if desired.
- Once a user identifies, future submissions should link to `userId`.

---

### `surveyResponses`
Stores responses for each question in a submission.

#### Fields
- `_id`
- `submissionId`: Id<"surveySubmissions">
- `questionDocId`: Id<"surveyQuestions">
- `questionId`: string
- `selectedOptionId`: string | null
- `selectedValue`: string | number | null
- `selectedLabel`: string | null
- `score`: number | null
- `createdAt`: number

#### Notes
- Keep both ids and display values for easier reporting snapshots.

---

### `surveyResults`
Stores computed results for a submission.

#### Fields
- `_id`
- `submissionId`: Id<"surveySubmissions">
- `surveyId`: Id<"surveys">
- `userId`: Id<"users"> | null
- `resultType`: `"catabolic"` | `"functional"` | `"combined"`
- `totalScore`: number
- `normalizedScore`: number | null
- `riskBandKey`: string
- `riskBandLabel`: string
- `summaryTitle`: string
- `summaryBody`: string
- `primaryCtaKey`: string | null
- `secondaryCtaKey`: string | null
- `createdAt`: number

#### Notes
- This stores the top-level result summary only.
- Detailed breakdowns should live in dedicated collections below or in structured fields if preferred.

---

### `resultCategoryScores`
Stores per-category math for the functional scorecard.

#### Fields
- `_id`
- `resultId`: Id<"surveyResults">
- `categoryKey`: string
- `categoryLabel`: string
- `rawScore`: number
- `maxScore`: number
- `normalizedPercent`: number
- `statusLabel`: string
- `isLowestCategory`: boolean
- `isHighestCategory`: boolean

---

### `resultPillarScores`
Stores per-pillar math for the functional scorecard.

#### Fields
- `_id`
- `resultId`: Id<"surveyResults">
- `pillarKey`: string
- `pillarLabel`: string
- `rawScore`: number
- `maxScore`: number
- `normalizedPercent`: number
- `statusLabel`: string
- `isLowestPillar`: boolean
- `isHighestPillar`: boolean

---

### `userPathways`
Stores the assigned pathway for a result.

#### Fields
- `_id`
- `resultId`: Id<"surveyResults">
- `userId`: Id<"users"> | null
- `pathwayKey`: string
- `pathwayLabel`: string
- `pathwayType`: `"standard"` | `"watch"` | `"active_recovery"` | `"high_risk"`
- `driverKey`: string | null
- `priorityRank`: number
- `createdAt`: number

#### Example pathway keys
- `standard_prevention`
- `catabolic_watch`
- `active_catabolic_recovery`
- `high_risk_catabolic_crisis`
- `post_illness_recovery`
- `post_surgery_immobilization`
- `sedentary_deconditioned_recovery`
- `weight_loss_muscle_preservation`
- `complex_catabolic_recovery`

---

### `reassessments`
Stores links between baseline and future survey results.

#### Fields
- `_id`
- `userId`: Id<"users">
- `baselineResultId`: Id<"surveyResults">
- `followupResultId`: Id<"surveyResults">
- `reassessmentType`: `"30_day"` | `"60_day"` | `"90_day"` | `"custom"`
- `daysSinceBaseline`: number
- `changeSummary`: string | null
- `createdAt`: number

---

### `reportSnapshots`
Optional collection for frozen generated report objects.

#### Fields
- `_id`
- `resultId`: Id<"surveyResults">
- `userId`: Id<"users"> | null
- `reportVersion`: string
- `payload`: any
- `createdAt`: number

#### Notes
- Useful if you later generate PDF or downloadable report snapshots.

---

## Suggested indexes

### `users`
- by `externalAuthId`
- by `email`

### `surveys`
- by `slug`
- by `status`

### `surveyQuestions`
- by `surveyId`
- by `surveyId, order`

### `surveyOptions`
- by `questionDocId`
- by `questionDocId, order`

### `surveySubmissions`
- by `surveyId`
- by `userId`
- by `userId, completedAt`

### `surveyResponses`
- by `submissionId`
- by `submissionId, questionId`

### `surveyResults`
- by `submissionId`
- by `userId`
- by `userId, createdAt`
- by `surveyId, createdAt`

### `resultCategoryScores`
- by `resultId`

### `resultPillarScores`
- by `resultId`

### `userPathways`
- by `resultId`
- by `userId`
- by `pathwayKey`

### `reassessments`
- by `userId`
- by `baselineResultId`

---

## Minimal V1 schema recommendation

For a faster launch, you can start with only:
- `users`
- `surveys`
- `surveyQuestions`
- `surveyOptions`
- `surveySubmissions`
- `surveyResponses`
- `surveyResults`
- `userPathways`

Then add:
- `resultCategoryScores`
- `resultPillarScores`
- `reassessments`
- `reportSnapshots`

once the first live flow works.

---

## Design principles

### 1. Keep survey content versioned
Never overwrite live survey logic without a version bump.

### 2. Save raw responses and computed results separately
This makes rescoring and audits much easier later.

### 3. Separate pathway assignment from score math
This allows you to revise pathway logic without changing the underlying raw answers.

### 4. Prefer stable keys over display text
Use keys such as `active_catabolic_recovery` and render human-readable labels in the app.

### 5. Keep protected health-style data minimal
Store only what the product truly needs.
