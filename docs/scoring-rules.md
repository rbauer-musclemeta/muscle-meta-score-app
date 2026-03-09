# Scoring Rules

## Purpose

This document defines the scoring logic for the Muscle-Meta assessment system, including:
- Catabolic Crisis Screen scoring
- override rules
- pathway routing
- Functional Decline & Muscle Risk Scorecard category scoring
- pillar math and normalization
- result labels and interpretation

This file is intended to serve as the single source of truth for scoring logic used by the frontend, backend, reporting layer, and future AI-assisted content or coaching flows.

---

## 1. Catabolic Crisis Screen

### Goal

The Catabolic Crisis Screen is a short front-end screening tool used before the full Functional Decline & Muscle Risk Scorecard.

Its purpose is to detect whether the user is showing signs of a recent or active catabolic crisis pattern such as:
- hospitalization
- illness
- surgery or immobilization
- unintended weight loss
- reduced appetite
- major inactivity or bed rest

This screen acts as a risk escalator and routing layer.

### Question set

The Catabolic Crisis Screen includes 3 scored questions:

1. Recent or impending medical event
2. Weight loss / appetite loss / visible muscle decline
3. Activity drop / deconditioning

An optional 4th question may be used for pathway assignment only:

4. Primary driver of the current situation

---

## 2. Catabolic Crisis Scoring

### Scored questions

Each scored question uses a 0-4 point scale.

- 0 = no current concern
- 1 = mild concern
- 2 = moderate concern
- 3 = significant concern
- 4 = severe or ongoing concern

### Question 1: Medical event

**Prompt:**
Have you had, or are you expecting, a medical event that significantly reduces your normal activity?

**Scoring:**
- 0 = no major illness, injury, hospitalization, or surgery recently or coming soon
- 1 = minor illness or outpatient procedure with less than 1 week of reduced activity
- 2 = illness, injury, or surgery causing about 1-2 weeks of reduced activity
- 3 = serious illness, hospitalization, or major surgery causing 2-6 weeks of reduced activity
- 4 = ICU stay, prolonged bed rest, major complications, or expected recovery longer than 6 weeks

### Question 2: Weight loss / appetite / muscle loss

**Prompt:**
In the past 6 months, have you had unintended weight loss, reduced appetite, or signs that you may be losing muscle?

**Scoring:**
- 0 = no meaningful change in appetite, body weight, or visible muscle
- 1 = slightly reduced appetite or small possible weight loss
- 2 = noticeable appetite drop, looser clothes, or feeling weaker than usual
- 3 = clear unintended weight loss, visible muscle loss, or weakness affecting function
- 4 = rapid unintended weight loss, trouble eating enough, or visible wasting

### Question 3: Activity drop

**Prompt:**
How much has your activity level dropped recently compared with your usual level?

**Scoring:**
- 0 = no major drop; moving at about normal level
- 1 = slight drop; a bit less active but still moving most days
- 2 = moderate drop; walking, exercise, or daily activity is noticeably lower
- 3 = major drop; mostly sedentary or several days of bed rest / chair rest
- 4 = severe drop; 1 or more weeks of near-total inactivity or still not back to prior level

### Total Catabolic Crisis Score

**Formula:**

```text
catabolic_crisis_total = q1_medical_event + q2_weight_appetite_muscle + q3_activity_drop
```

**Range:**
- minimum = 0
- maximum = 12

---

## 3. Catabolic Crisis Risk Bands

### Risk band interpretation

- **0-1** = No Current Catabolic Crisis Flag
- **2-3** = Catabolic Stress Watch
- **4-6** = Active Catabolic Recovery Needed
- **7-12** = High-Risk Catabolic Crisis Pattern

### Interpretation intent

These bands are not diagnoses.
They are used to:
- identify likely muscle-loss acceleration
- guide the appropriate next-step experience
- trigger support messaging
- escalate users into more protective pathways

---

## 4. Catabolic Crisis Override Rules

Override rules are used when a severe answer should elevate the user into a higher-support pathway even if the total score is not extremely high.

### Rule set

#### Rule 1: Major medical event override
If Question 1 score is 3 or 4:
- assign at least **Active Catabolic Recovery Needed**

#### Rule 2: Significant weight loss override
If Question 2 score is 3 or 4:
- assign at least **Active Catabolic Recovery Needed**

#### Rule 3: Severe inactivity override
If Question 3 score is 4:
- assign at least **Active Catabolic Recovery Needed**

#### Rule 4: Multi-trigger escalation
If the optional driver question is **More than one of these** and the total catabolic score is 6 or more:
- assign **High-Risk Catabolic Crisis Pattern**

### Red-flag escalation guidance

Add a high-priority message when any of the following are present:
- rapid unintended weight loss
- visible wasting
- prolonged bed rest
- ICU stay
- major surgery with long recovery
- severe weakness or inability to resume normal daily activity

These do not automatically create a diagnosis, but they should trigger stronger messaging and a provider-consult recommendation.

---

## 5. Catabolic Crisis Pathway Routing

### Primary routing by score

- **0-1** -> Standard Functional Scorecard Path
- **2-3** -> Catabolic Watch Pathway
- **4-6** -> Active Catabolic Recovery Pathway
- **7-12** -> High-Risk Catabolic Crisis Pathway

### Secondary routing by dominant driver

If the optional driver question is present, assign a more specific pathway tag.

#### Driver options
- illness or hospitalization
- surgery, injury, or immobilization
- sedentary lifestyle / deconditioning
- weight loss, appetite loss, or difficulty eating
- more than one of these
- not sure

### Specific pathway mapping

- **illness or hospitalization** -> Post-Illness Recovery Pathway
- **surgery, injury, or immobilization** -> Post-Surgery / Immobilization Pathway
- **sedentary lifestyle / deconditioning** -> Sedentary / Deconditioned Recovery Pathway
- **weight loss, appetite loss, or difficulty eating** -> Weight Loss / Muscle Preservation Pathway
- **more than one of these** -> Complex Catabolic Recovery Pathway
- **not sure** -> General Catabolic Recovery Pathway

### Routing priority

If both score band and driver tag are present:
1. assign the broad risk band first
2. then apply the specific pathway tag
3. then show pathway-specific copy and CTA

Example:
- broad risk band = Active Catabolic Recovery Needed
- driver tag = Post-Illness Recovery Pathway

---

## 6. Functional Decline & Muscle Risk Scorecard

### Goal

The Functional Decline & Muscle Risk Scorecard measures broader patterns of:
- strength
- mobility
- balance
- endurance
- recovery
- daily function
- nutrition and metabolism
- brain and stress-related resilience

It is the main front-end assessment and feeds pathway recommendations, results dashboards, and future reassessment workflows.

### Scorecard structure

Recommended MVP structure:
- 24 scored questions
- 12 categories
- 2 questions per category
- each question scored 1-5

### Question scoring scale

For the Functional Decline Scorecard, each question uses a 1-5 scale.

- 1 = severe limitation / very poor / very inconsistent
- 2 = significant difficulty / poor / rarely
- 3 = moderate concern / sometimes / fair
- 4 = mild concern / usually / good
- 5 = strong function / consistent / very good

### Total raw score range

- minimum = 24
- maximum = 120

---

## 7. Functional Scorecard Categories

Each category contains 2 scored questions.
Each category score ranges from 2 to 10.

### Categories

1. Joint Health
2. Functional Independence
3. Mobility
4. Balance
5. Recovery
6. Endurance
7. Strength
8. Nutrition
9. Lifestyle
10. Brain Health
11. Stress Management
12. Metabolic Flexibility

### Category formula

```text
category_score = question_1 + question_2
```

### Category score range

- minimum = 2
- maximum = 10

### Category interpretation

- **9-10** = strong / low concern
- **7-8** = stable but could improve
- **5-6** = early decline / moderate concern
- **2-4** = significant concern / priority area

---

## 8. Pillar Mapping

The 12 categories roll up into 4 pillars.

### Pillar 1: Exercise & Mobility
Includes:
- Joint Health
- Functional Independence
- Mobility
- Endurance
- Strength

### Pillar 2: Nutrition & Metabolism
Includes:
- Nutrition
- Metabolic Flexibility

### Pillar 3: Recovery & Stress
Includes:
- Recovery
- Lifestyle
- Stress Management

### Pillar 4: Balance & Brain Health
Includes:
- Balance
- Brain Health

---

## 9. Pillar Math

Because each pillar contains a different number of categories, raw scores must be normalized.

### Raw score ranges by pillar

#### Exercise & Mobility
- 5 categories
- raw range = 10-50

#### Nutrition & Metabolism
- 2 categories
- raw range = 4-20

#### Recovery & Stress
- 3 categories
- raw range = 6-30

#### Balance & Brain Health
- 2 categories
- raw range = 4-20

### Pillar raw formulas

```text
exercise_mobility_raw = joint_health + functional_independence + mobility + endurance + strength
nutrition_metabolism_raw = nutrition + metabolic_flexibility
recovery_stress_raw = recovery + lifestyle + stress_management
balance_brain_raw = balance + brain_health
```

### Pillar normalization formula

```text
pillar_percent = (pillar_raw / pillar_max) * 100
```

### Example

If Exercise & Mobility raw score is 34:

```text
exercise_mobility_percent = (34 / 50) * 100 = 68
```

---

## 10. Functional Scorecard Total Score Math

### Formula

```text
total_functional_score = sum(all 24 scored questions)
```

### Total score interpretation

- **103-120** = Resilient / Low Current Concern
- **85-102** = Stable with Early Weak Links
- **66-84** = Early Functional Decline Pattern
- **47-65** = Moderate Muscle / Function Risk
- **24-46** = High Functional Decline / Muscle Risk

These cut points are product-level interpretation bands and should be treated as educational guidance rather than clinical diagnosis thresholds.

---

## 11. Functional Scorecard Priority Logic

### Primary focus pillar

Identify the pillar with the **lowest normalized percentage**.
This becomes the user's primary focus pillar.

### Primary focus category

Identify the category with the **lowest category score**.
This becomes the user's best starting category.

### Secondary focus area

If:
- 2 pillars are within 5 percentage points of each other, or
- 2 categories are tied for lowest,

then show 2 focus areas rather than only 1.

### Strongest area

Also identify:
- highest normalized pillar
- highest scoring category if useful for results copy

This supports strengths-based messaging alongside risk interpretation.

---

## 12. Functional Scorecard Override Rules

Use override rules to ensure important functional red flags are not hidden by a decent total score.

### Recommended override triggers

Escalate the user's concern level or add warning language if any of the following are true:
- Balance category score = 2-4
- Functional Independence category score = 2-4
- user reports inability to get up from the floor
- user reports severe stair insecurity
- user reports major daily task difficulty
- user reports frequent falls or near falls
- total functional score < 47

### Intent

These rules are especially important because fall risk, transfer difficulty, and daily-task breakdown can indicate disproportionate real-world risk.

---

## 13. Results Output Requirements

Each results object should include the following fields.

### Catabolic Crisis Screen output
- catabolic crisis total score
- catabolic risk band
- override flags
- dominant driver tag
- assigned pathway
- main CTA
- optional alert message

### Functional Scorecard output
- total functional score
- overall result label
- category scores
- pillar raw scores
- pillar normalized percentages
- weakest pillar
- strongest pillar
- lowest category
- second-lowest category if applicable
- override flags
- recommended starting point
- pathway recommendation

---

## 14. Recommended Result Labels

### Catabolic Crisis labels
- No Current Catabolic Crisis Flag
- Catabolic Stress Watch
- Active Catabolic Recovery Needed
- High-Risk Catabolic Crisis Pattern

### Functional Scorecard labels
- Resilient but Reinforce the Foundation
- Stable, with Early Weak Links
- Early Functional Decline Pattern
- Muscle Resilience at Risk
- Higher Functional Decline Risk

---

## 15. Pseudocode Reference

### Catabolic Crisis Screen

```text
catabolic_total = q1 + q2 + q3

if q1 >= 3 or q2 >= 3 or q3 == 4:
  minimum_band = "Active Catabolic Recovery Needed"

if catabolic_total <= 1:
  band = "No Current Catabolic Crisis Flag"
elif catabolic_total <= 3:
  band = "Catabolic Stress Watch"
elif catabolic_total <= 6:
  band = "Active Catabolic Recovery Needed"
else:
  band = "High-Risk Catabolic Crisis Pattern"

if minimum_band is higher than band:
  band = minimum_band

assign pathway_tag from driver question
```

### Functional Scorecard

```text
for each category:
  category_score = q1 + q2

exercise_mobility_raw = joint_health + functional_independence + mobility + endurance + strength
nutrition_metabolism_raw = nutrition + metabolic_flexibility
recovery_stress_raw = recovery + lifestyle + stress_management
balance_brain_raw = balance + brain_health

exercise_mobility_percent = (exercise_mobility_raw / 50) * 100
nutrition_metabolism_percent = (nutrition_metabolism_raw / 20) * 100
recovery_stress_percent = (recovery_stress_raw / 30) * 100
balance_brain_percent = (balance_brain_raw / 20) * 100

total_functional_score = sum(all category questions)

weakest_pillar = min(normalized pillar percents)
lowest_category = min(category_scores)
```

---

## 16. Implementation Notes

### Source of truth

These rules should be implemented once in backend logic and reused by:
- the survey flow
- results screens
- report generation
- dashboards
- reassessment comparisons

### Recommendation

Do not duplicate scoring math independently across multiple frontend components.
The frontend may display derived results, but the backend should remain the authoritative scoring engine.

### Storage suggestion

For each submission, store:
- raw answers
- raw scores
- derived category scores
- derived pillar scores
- normalized pillar values
- override flags
- result labels
- assigned pathway
- timestamp
- survey version

### Versioning

Add a version field to all scoring logic objects.

Example:

```text
scoring_version = "v1.0"
```

This will allow you to revise logic later without corrupting older saved results.

---

## 17. Future Extensions

Potential future additions:
- weighted scoring for special high-risk items
- age-adjusted interpretation
- osteosarcopenia risk overlays
- reassessment delta scoring
- provider-facing clinical summary mode
- confidence score based on completion quality or missing data

---

## 18. Disclaimer

This scoring system is educational and is intended to guide pathway selection, self-awareness, and content personalization.
It is not a medical diagnosis system and does not replace qualified clinical evaluation.
