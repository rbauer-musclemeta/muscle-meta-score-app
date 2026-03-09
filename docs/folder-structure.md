# Folder Structure

## Recommended Repository Layout

```text
muscle-meta-app/
├── docs/
│   ├── architecture-overview.md
│   ├── folder-structure.md
│   ├── data-model.md
│   ├── build-roadmap.md
│   ├── scoring-rules.md
│   └── deployment.md
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.webmanifest
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── providers/
│   │   ├── layouts/
│   │   └── router.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── survey/
│   │   ├── results/
│   │   ├── dashboard/
│   │   ├── pathways/
│   │   └── marketing/
│   ├── features/
│   │   ├── auth/
│   │   ├── catabolic-crisis/
│   │   ├── functional-scorecard/
│   │   ├── pathways/
│   │   ├── reassessment/
│   │   └── reports/
│   ├── content/
│   │   ├── surveys/
│   │   ├── results/
│   │   ├── pathways/
│   │   └── reports/
│   ├── lib/
│   │   ├── api/
│   │   ├── scoring/
│   │   ├── routing/
│   │   ├── constants/
│   │   ├── validation/
│   │   └── utils/
│   ├── hooks/
│   ├── styles/
│   ├── types/
│   └── main.tsx
├── convex/
│   ├── schema.ts
│   ├── auth.config.ts
│   ├── users.ts
│   ├── surveys.ts
│   ├── surveyQuestions.ts
│   ├── surveyOptions.ts
│   ├── submissions.ts
│   ├── results.ts
│   ├── pathways.ts
│   ├── reassessments.ts
│   └── reports.ts
├── scripts/
│   ├── import-surveys.ts
│   ├── export-results.ts
│   └── seed-content.ts
├── skills/
│   ├── survey-builder/
│   │   └── skill.md
│   ├── scoring-engine/
│   │   └── skill.md
│   ├── pathway-copy/
│   │   └── skill.md
│   └── results-writer/
│       └── skill.md
├── .env.example
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Folder Purpose

### `/docs`
Contains project documentation.

Use this folder for:
- architecture decisions
- data model definitions
- build plans
- deployment instructions
- scoring and pathway logic references

### `/public`
Contains static assets served directly by the frontend.

Use this folder for:
- icons
- images
- PWA manifest
- favicon

### `/src`
Contains the main frontend application.

This folder should hold UI, routing, content rendering, and app-level logic.

## Recommended Frontend Substructure

### `/src/app`
Contains app shell setup.

Use for:
- route definitions
- providers
- layout wrappers
- global app configuration

### `/src/components`
Contains reusable presentation components.

Examples:
- buttons
- form cards
- result cards
- dashboard widgets
- progress bars
- pathway cards

Keep these mostly UI-focused and reusable across features.

### `/src/features`
Contains feature-specific logic and components grouped by product area.

Examples:
- Catabolic Crisis Screen
- Functional Decline Scorecard
- pathway recommendation flow
- reassessment experience

This is where screen-level and feature-level behavior should live.

### `/src/content`
Contains editable structured content.

Examples:
- question definitions
- answer labels
- pathway copy
- report templates
- results text

This keeps wording and education content easier to maintain.

### `/src/lib`
Contains shared internal logic and technical utilities.

Examples:
- API clients
- scoring helpers
- route mapping helpers
- input validation
- constants
- generic utilities

### `/src/hooks`
Contains custom React hooks.

Examples:
- survey state hooks
- auth hooks
- progress hooks
- submission hooks

### `/src/styles`
Contains global styles or design tokens.

### `/src/types`
Contains shared TypeScript types and interfaces.

## Backend Structure

### `/convex`
Contains Convex schema and backend functions.

Recommended responsibilities:
- schema definitions
- queries
- mutations
- internal scoring functions
- pathway assignment logic
- result persistence
- report generation helpers

## Script Utilities

### `/scripts`
Contains one-off or repeatable development and admin utilities.

Examples:
- importing survey definitions from JSON
- seeding content
- exporting results for analysis

## Skills Folder

### `/skills`
Contains project-specific `skill.md` files that guide repeatable AI-assisted workflows.

Good initial skill candidates:
- survey builder
- scoring engine updater
- pathway copy writer
- results summary writer

## Structure Philosophy
Use a hybrid structure:
- feature-based organization for product workflows
- shared component and utility layers for reuse
- content separated from code where possible

This makes it easier to:
- expand assessments
- revise copy without rewriting app logic
- onboard collaborators
- support AI-assisted coding and documentation

## Example Feature Layout

Example for `catabolic-crisis`:

```text
src/features/catabolic-crisis/
├── components/
│   ├── CatabolicIntroCard.tsx
│   ├── CatabolicQuestionCard.tsx
│   ├── CatabolicResultCard.tsx
│   └── PathwayBadge.tsx
├── hooks/
│   └── useCatabolicSurvey.ts
├── pages/
│   ├── CatabolicIntroPage.tsx
│   ├── CatabolicQuizPage.tsx
│   └── CatabolicResultPage.tsx
├── content/
│   └── catabolicSurveyContent.ts
├── logic/
│   └── catabolicClientHelpers.ts
└── types/
    └── catabolicTypes.ts
```

## Recommended Naming Rules
- use clear feature names
- keep filenames descriptive
- avoid mixing marketing and app logic in the same folders
- keep survey content and score logic separate when possible

## Scaling Guidance
As the platform grows, you may later split into:
- one repo for public marketing content
- one repo for the secure app

For version 1, one repository is the most practical starting point.
