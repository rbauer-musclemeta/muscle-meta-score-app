# Scoring Engine Spec

## Purpose
This document maps the Muscle-Meta scoring rules into build-ready application logic. It is intended to guide implementation across:
- Convex collections
- backend scoring functions
- frontend result objects
- pathway routing and CTA generation

It complements:
- `survey-schema.json`
- `scoring-rules.md`
- `data-model.md`

---

## 1. System scope
The scoring engine currently supports two linked experiences:
1. **Catabolic Crisis Screen**
2. **Functional Decline & Muscle Risk Scorecard**

The Catabolic Crisis Screen runs first and may change what happens next.

### Desired behavior
- capture survey responses
- score responses server-side
- apply override rules
- assign a pathway
- generate a normalized frontend result object
- save result snapshots for reassessment and trend tracking

---

## 2. Convex collection mapping

### `surveys`
Stores survey definitions.

Suggested fields:
- `_id`
- `surveyId`
- `title`
- `type`
- `version`
- `isActive`
- `description`

### `surveyQuestions`
Stores individual questions.

Suggested fields:
- `_id`
- `surveyId`
- `questionId`
- `order`
- `kind`
- `prompt`
- `required`
- `categoryId`
- `pillarId`
- `scored`

### `surveyOptions`
Stores answer options.

Suggested fields:
- `_id`
- `surveyId`
- `questionId`
- `optionId`
- `label`
- `score`
- `sortOrder`

### `surveySubmissions`
Stores a single completed attempt.

Suggested fields:
- `_id`
- `surveyId`
- `userId`
- `startedAt`
- `completedAt`
- `status`
- `version`

### `surveyResponses`
Stores one answer per question.

Suggested fields:
- `_id`
- `submissionId`
- `surveyId`
- `questionId`
- `optionId`
- `score`
- `rawValue`

### `surveyResults`
Stores the scored result snapshot.

Suggested fields:
- `_id`
- `submissionId`
- `surveyId`
- `userId`
- `resultVersion`
- `totalScore`
- `riskBand`
- `riskLabel`
- `categoryScores`
- `pillarScores`
- `weakestPillar`
- `strongestPillar`
- `lowestCategory`
- `topFocusAreas`
- `pathwayId`
- `pathwayTag`
- `redFlags`
- `summary`
- `recommendedCta`
- `detailBlocks`
- `createdAt`

### `pathways`
Stores pathway metadata.

Suggested fields:
- `_id`
- `pathwayId`
- `tag`
- `title`
- `description`
- `primaryCta`
- `secondaryCta`
- `priorityOrder`

### `userPathways`
Stores the assigned pathway history for a user.

Suggested fields:
- `_id`
- `userId`
- `submissionId`
- `pathwayId`
- `pathwayTag`
- `assignedAt`
- `isCurrent`

---

## 3. Backend function map

Suggested Convex function structure:

### `surveys.getActiveSurvey(surveyId)`
Returns active survey definition, questions, and options.

### `submissions.createSubmission({ surveyId, userId })`
Creates a draft submission record.

### `submissions.saveResponse({ submissionId, questionId, optionId })`
Saves or updates a single response.

### `submissions.completeSubmission({ submissionId })`
Marks a submission complete and triggers scoring.

### `results.scoreCatabolicCrisis({ submissionId })`
Scores the Catabolic Crisis Screen.

Responsibilities:
- load responses
- compute `totalScore`
- assign `riskBand`
- apply override rules
- assign `pathwayTag`
- generate frontend result object
- save `surveyResults`

### `results.scoreFunctionalRisk({ submissionId })`
Scores the Functional Decline & Muscle Risk Scorecard.

Responsibilities:
- load responses
- compute category scores
- compute pillar raw scores
- normalize pillar percentages
- compute total score
- apply red flag rules
- identify weakest pillar and lowest category
- generate frontend result object
- save `surveyResults`

### `results.getLatestUserResults({ userId })`
Returns the latest score snapshots for dashboard display.

### `pathways.assignPathway({ submissionId, userId, pathwayId, pathwayTag })`
Persists pathway history and marks the current assignment.

---

## 4. Catabolic Crisis scoring logic

### Inputs
Scored questions:
- `cc_q1_medical_event`
- `cc_q2_weight_appetite_muscle`
- `cc_q3_activity_drop`

Routing question:
- `cc_driver`

### Score formula
```text
catabolicTotal = q1 + q2 + q3
```

### Risk bands
- `0–1` → `no_flag`
- `2–3` → `watch`
- `4–6` → `active_recovery`
- `7–12` → `high_risk`

### Override rules
Apply after total score calculation.

#### Rule 1
If `cc_q1_medical_event >= 3`, result cannot be below `active_recovery`.

#### Rule 2
If `cc_q2_weight_appetite_muscle >= 3`, result cannot be below `active_recovery`.

#### Rule 3
If `cc_q3_activity_drop == 4`, result cannot be below `active_recovery`.

#### Rule 4
If `cc_driver == "multiple"` and `catabolicTotal >= 6`, upgrade result to `high_risk`.

### Pathway tag mapping
- `illness` → `Post-Illness Recovery Pathway`
- `surgery` → `Post-Surgery / Immobilization Pathway`
- `sedentary` → `Sedentary / Deconditioned Recovery Pathway`
- `weight_loss` → `Weight Loss / Muscle Preservation Pathway`
- `multiple` → `Complex Catabolic Recovery Pathway`
- `unsure` → `General Catabolic Recovery Pathway`

### Primary route mapping
- `no_flag` → `standard_functional_decline_scorecard`
- `watch` → `catabolic_watch_pathway`
- `active_recovery` → `active_catabolic_recovery_pathway`
- `high_risk` → `high_risk_catabolic_crisis_pathway`

---

## 5. Functional Scorecard scoring logic

### Inputs
24 scored questions across 12 categories.

### Category scoring
Each category contains 2 questions.

```text
categoryScore = question1 + question2
```

Category range:
- minimum = `2`
- maximum = `10`

### Category band mapping
- `9–10` → `strong`
- `7–8` → `stable`
- `5–6` → `early_decline`
- `2–4` → `priority`

### Pillar raw scores

#### Exercise & Mobility
Categories:
- joint_health
- functional_independence
- mobility
- endurance
- strength

Raw range:
- min = `10`
- max = `50`

#### Nutrition & Metabolism
Categories:
- nutrition
- metabolic_flexibility

Raw range:
- min = `4`
- max = `20`

#### Recovery & Stress
Categories:
- recovery
- lifestyle
- stress_management

Raw range:
- min = `6`
- max = `30`

#### Balance & Brain Health
Categories:
- balance
- brain_health

Raw range:
- min = `4`
- max = `20`

### Pillar normalization
```text
pillarPercent = (pillarRaw / pillarMax) * 100
```

### Total score
```text
totalScore = sum(all 24 question scores)
```

Total range:
- minimum = `24`
- maximum = `120`

### Total band mapping
- `103–120` → `resilient`
- `85–102` → `stable_weak_links`
- `66–84` → `early_pattern`
- `47–65` → `moderate_risk`
- `24–46` → `high_risk`

### Red flag rules
#### Rule 1
If `balance <= 4`, raise priority.

#### Rule 2
If `functional_independence <= 4`, raise priority.

#### Rule 3
If `fi_2 <= 2`, add floor transfer red flag.

#### Rule 4
If `ba_2 <= 2`, add stair/balance confidence red flag.

### Derived frontend values
Backend should calculate and return:
- `strongestPillar`
- `weakestPillar`
- `lowestCategory`
- `topFocusAreas`
- `redFlags`
- `recommendedCta`
- `summary`

---

## 6. Frontend result object contracts

## A. Catabolic result object
```json
{
  "surveyId": "catabolic_crisis_screen_v1",
  "submissionId": "sub_123",
  "userId": "user_123",
  "totalScore": 5,
  "riskBand": "active_recovery",
  "riskLabel": "Active Catabolic Recovery Needed",
  "primaryPathway": "active_catabolic_recovery_pathway",
  "pathwayTag": "Post-Illness Recovery Pathway",
  "redFlags": ["significant_weight_loss"],
  "recommendedCta": {
    "primary": "Start My Recovery Plan",
    "secondary": "Continue to My Full Muscle Risk Score"
  },
  "summary": "Your answers suggest an active muscle-loss risk pattern.",
  "detailBlocks": [
    {
      "type": "body",
      "title": "What this means",
      "content": "A recent illness, drop in activity, or weight/appetite change may be increasing muscle loss and slowing recovery."
    }
  ]
}
```

## B. Functional result object
```json
{
  "surveyId": "functional_decline_muscle_risk_scorecard_v1",
  "submissionId": "sub_456",
  "userId": "user_123",
  "totalScore": 72,
  "totalBand": "early_pattern",
  "totalLabel": "Early functional decline pattern",
  "categoryScores": {
    "joint_health": 6,
    "functional_independence": 5,
    "mobility": 7,
    "balance": 4,
    "recovery": 6,
    "endurance": 5,
    "strength": 5,
    "nutrition": 7,
    "lifestyle": 6,
    "brain_health": 8,
    "stress_management": 7,
    "metabolic_flexibility": 6
  },
  "pillarScores": {
    "exercise_mobility": { "raw": 28, "percent": 56 },
    "nutrition_metabolism": { "raw": 13, "percent": 65 },
    "recovery_stress": { "raw": 19, "percent": 63 },
    "balance_brain": { "raw": 12, "percent": 60 }
  },
  "weakestPillar": "exercise_mobility",
  "strongestPillar": "nutrition_metabolism",
  "lowestCategory": "balance",
  "topFocusAreas": ["balance", "functional_independence"],
  "redFlags": ["low_balance", "floor_transfer_concern"],
  "recommendedCta": {
    "primary": "Start My Recommended Pathway",
    "secondary": "View My Full Results"
  },
  "summary": "You are showing an early functional decline pattern with balance and functional independence as key opportunities.",
  "detailBlocks": []
}
```

---

## 7. CTA generation rules

### Catabolic results
- `no_flag` → primary: `Continue to My Full Muscle Risk Score`
- `watch` → primary: `Start My Muscle Preservation Plan`
- `active_recovery` → primary: `Start My Recovery Plan`
- `high_risk` → primary: `View My High-Priority Recovery Steps`

Secondary CTA for all catabolic outcomes:
- `Continue to My Full Muscle Risk Score`

### Functional results
Use the weakest pillar and lowest category to determine the next offer.

Examples:
- weakest pillar `exercise_mobility` + lowest category `strength` → `Start My Strength for Daily Function Pathway`
- weakest pillar `balance_brain` + lowest category `balance` → `Start My Balance & Fall Confidence Pathway`
- weakest pillar `recovery_stress` + lowest category `recovery` → `Start My Recovery Reset Pathway`
- weakest pillar `nutrition_metabolism` + lowest category `metabolic_flexibility` → `Start My Metabolic Stability Pathway`

---

## 8. Versioning rules
- every survey definition should have a `version`
- every scored result should store `resultVersion`
- do not recalculate old results using new scoring rules without preserving the original snapshot
- pathway routing should always be reproducible from stored responses + stored version

---

## 9. Implementation notes
- score server-side, not only in the browser
- persist raw responses before scoring
- save result snapshots for longitudinal tracking
- keep pathway tags separate from risk bands
- treat red flags as additive metadata, not only as UI copy
- use frontend result objects as stable contracts between backend and UI

---

## 10. Recommended next files
To make this implementation-ready, the next strongest companion files would be:
- `convex-schema-spec.md`
- `convex-functions-spec.md`
- `frontend-result-components.md`
- `pathway-cta-map.json`
