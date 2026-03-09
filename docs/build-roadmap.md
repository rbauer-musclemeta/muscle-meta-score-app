# Build Roadmap

## Goal
Launch a secure, assessment-driven Muscle-Meta web app and PWA that:
- screens for catabolic crisis
- assesses muscle and functional decline risk
- routes users into tailored pathways
- stores results securely
- supports reassessment over time

## Build Philosophy
Start with the smallest version that proves the experience works.

Version 1 should focus on:
- one clear onboarding flow
- one secure backend
- one public-to-private user journey
- one reusable scoring and pathway engine

Avoid trying to build every future course, dashboard, and content module before the assessment and routing system is working.

## Phase 0: Planning and Definition
### Objectives
- finalize architecture choices
- define the survey and pathway system
- document data structures
- confirm deployment approach

### Deliverables
- architecture overview
- folder structure
- data model
- survey JSON package
- scoring rules
- pathway definitions

### Exit criteria
- all core questions are defined
- score logic is documented
- route logic is documented
- repo structure is decided

## Phase 1: Repo and Environment Setup
### Objectives
- create the frontend repo
- set up Convex backend
- connect auth
- prepare Netlify deployment

### Tasks
- initialize React/Vite app
- configure TypeScript
- add Tailwind or equivalent styling layer
- install Convex
- install Clerk
- configure environment variables
- create Netlify configuration
- add docs folder

### Deliverables
- working local frontend
- working Convex project
- working auth integration
- initial production deployment target

### Exit criteria
- app runs locally
- frontend can talk to Convex
- authentication works in development
- Netlify preview deployment succeeds

## Phase 2: Survey Content and Backend Schema
### Objectives
- build the survey content system
- define backend schema
- make the app able to load questions dynamically

### Tasks
- create `surveys` schema
- create `surveyQuestions` schema
- create `surveyOptions` schema
- create `surveySubmissions` schema
- create `surveyResponses` schema
- create `surveyResults` schema
- import catabolic crisis survey definition
- load questions from backend or structured content source

### Deliverables
- working schema
- seed script or import script
- survey question fetch flow

### Exit criteria
- survey renders dynamically from data
- question order is correct
- answer options display correctly
- submission records can be created

## Phase 3: Catabolic Crisis Screen MVP
### Objectives
- launch the first working screening experience
- calculate score and pathway
- show a useful result page

### Tasks
- build intro screen
- build 3-question flow
- build optional dominant-driver question
- store answers
- calculate total score
- apply override rules
- assign pathway
- render result card
- render pathway card
- add red-flag messaging

### Deliverables
- complete Catabolic Crisis Screen flow
- results screen
- saved submission and result record

### Exit criteria
- users can complete the flow
- results are calculated correctly
- assigned pathway is visible
- data is saved

## Phase 4: Functional Decline & Muscle Risk Scorecard MVP
### Objectives
- build the broader scorecard after the catabolic screen
- generate total score, category scores, and pillar scores

### Tasks
- add survey definition for functional scorecard
- build multi-step question flow
- store answers and submission
- calculate category scores
- calculate normalized pillar scores
- determine strongest and weakest pillars
- generate results summary
- connect recommendation logic

### Deliverables
- main scorecard experience
- score summary
- pillar and category results
- recommendation output

### Exit criteria
- scorecard can be completed end to end
- results are saved
- pillar calculations are correct
- recommendation routing works

## Phase 5: Account, Saved Progress, and Dashboard
### Objectives
- give users persistent access to their results
- create a simple logged-in dashboard

### Tasks
- protect app routes with authentication
- link submissions and results to user records
- build dashboard page
- show latest results
- show pathway status
- show prior assessments

### Deliverables
- authenticated dashboard
- saved results history
- current pathway display

### Exit criteria
- returning users can log in
- returning users can see prior results
- latest pathway is visible

## Phase 6: Reassessment Engine
### Objectives
- support repeat assessment over time
- compare prior results and show change

### Tasks
- create reassessment flow
- create reassessment collection or link structure
- compare previous and current results
- show progress language
- schedule reassessment prompts later if desired

### Deliverables
- reassessment submission flow
- progress comparison view
- updated pathway logic if needed

### Exit criteria
- users can reassess
- system tracks change over time
- results comparison is understandable

## Phase 7: Reports and Content Routing
### Objectives
- turn results into deeper value
- route users into content or next steps

### Tasks
- create result-based recommendation engine
- create pathway-specific next-step cards
- add downloadable report generation if desired
- add lesson or action-plan routing

### Deliverables
- pathway-driven recommendations
- report content or downloadable summaries
- more tailored user experience

### Exit criteria
- results clearly lead to next steps
- users can access tailored recommendations

## Recommended Order of Execution
1. Docs and architecture
2. Repo setup
3. Convex schema
4. Catabolic Crisis Screen
5. Functional Scorecard
6. Dashboard and saved progress
7. Reassessment loop
8. Reports and pathway-driven content

## Version 1 Scope Recommendation
For the fastest useful launch, include only:
- public entry page
- Catabolic Crisis Screen
- Functional Decline Scorecard
- Convex-backed submissions and results
- basic auth
- simple results page
- simple dashboard

Do not include yet unless needed:
- advanced admin panel
- full lesson library
- complex cohort analytics
- elaborate report export engine
- multiple parallel marketing funnels

## Suggested Milestones
### Milestone 1
Project setup complete

### Milestone 2
Catabolic Crisis Screen working

### Milestone 3
Functional Scorecard working

### Milestone 4
User dashboard working

### Milestone 5
Reassessment and pathway history working

## Suggested Technical Build Order
### Frontend first pieces
- app shell
- routing
- survey card components
- progress UI
- results card UI

### Backend first pieces
- schema
- survey content import
- submission creation
- response save mutation
- scoring function
- result save mutation

### Integration pieces
- auth guard
- user-to-result linking
- dashboard queries
- production environment variables

## Team and Tooling Recommendation
Use Codex to help generate and iterate on:
- schema files
- survey components
- scoring functions
- result components
- dashboard pages
- docs and tests

Use Markdown docs in the repo to keep the architecture and data model clear for both human collaborators and AI-assisted coding workflows.

Use project-specific `skill.md` files once repeated development patterns begin to emerge.

## Launch Recommendation
The best first public launch is:
- a clean landing page
- a guided Catabolic Crisis Screen
- the full Functional Decline Scorecard
- a result page with a clear next step
- a simple saved dashboard for logged-in users

This gives you a meaningful, secure, assessment-based platform without overbuilding too early.

## Final Recommendation
Build in stages, but keep the structure scalable from the beginning.

The platform should launch as a focused assessment and pathway system, then expand into a fuller Muscle-Meta app with stored history, reassessment, and personalized education.
