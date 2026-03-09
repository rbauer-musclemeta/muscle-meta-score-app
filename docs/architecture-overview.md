# Architecture Overview

## Purpose
The Muscle-Meta app is a secure, assessment-driven web application and progressive web app (PWA) designed to guide users through onboarding, risk screening, pathway assignment, progress tracking, and reassessment.

The platform supports:
- public educational and conversion-oriented pages
- secure user assessments
- catabolic crisis screening
- functional decline and muscle risk scorecards
- pathway routing based on user profile and answers
- stored progress and reassessment over time

## Recommended Stack
### Frontend
- React with Vite
- Progressive Web App support
- Tailwind CSS or equivalent utility-first styling
- Component-based UI structure

### Hosting
- Netlify
- Continuous deployment from GitHub
- Optional preview deploys for feature branches

### Backend and Database
- Convex
- Secure data storage for survey submissions, results, pathways, and user records
- Backend functions for scoring, routing, and report generation

### Authentication
- Clerk with Convex
- Supports secure sign-in, user sessions, and linking saved results to a user account

### Documentation
- Markdown files stored in `/docs`

## Why This Stack
This stack fits the current Muscle-Meta product direction because the platform needs both a public-facing website and a secure personalized app experience.

Netlify is a strong fit for:
- fast static and client-rendered deployments
- landing pages and public marketing content
- easy Git-based deployment workflow
- PWA hosting

Convex is a strong fit for:
- storing user submissions securely
- handling scoring logic centrally
- routing users into the correct pathways
- supporting reassessment and dashboard history
- simplifying backend infrastructure compared with stitching together multiple services

Clerk is a strong fit for:
- simple and reliable user authentication
- support for saved user history and secure app access
- reducing custom auth overhead in early versions

## Product Layers
The platform should be treated as two connected layers.

### 1. Public Layer
This layer is open to all visitors and is focused on education, conversion, and onboarding.

Includes:
- landing pages
- pillar overview pages
- blog or article pages
- scorecard entry pages
- quiz introductions
- public lead generation flows

### 2. Secure App Layer
This layer is available to authenticated users and contains personalized data.

Includes:
- user dashboard
- stored assessment results
- catabolic crisis status
- pathway assignments
- risk score history
- recommended actions
- reassessment tracking

## Primary User Flow
1. User lands on the public site
2. User begins the Catabolic Crisis Screen
3. User continues into the Functional Decline & Muscle Risk Scorecard
4. User creates an account or submits email before full results if desired
5. Responses are sent to Convex
6. Convex scoring functions calculate:
   - catabolic crisis status
   - risk band
   - category scores
   - pillar scores
   - pathway assignment
7. Results are returned to the frontend
8. User sees a personalized results page
9. User can save, revisit, and reassess later

## Assessment Architecture
The assessment system should be modular.

### Layer 1: Catabolic Crisis Screen
A short screening flow used before the full scorecard.

Purpose:
- detect recent or active catabolic crisis patterns
- route users into a standard or crisis-focused pathway
- escalate support when higher-risk answers appear

### Layer 2: Functional Decline & Muscle Risk Scorecard
A broader functional and muscle-health assessment.

Purpose:
- evaluate strength, mobility, balance, recovery, endurance, and metabolic resilience
- generate total score and risk band
- identify strongest and weakest pillars
- assign first-step recommendations

### Layer 3: Reassessment Loop
Used after 30, 60, or 90 days.

Purpose:
- track user progress over time
- compare prior scores against new scores
- update pathway recommendations
- reinforce engagement and retention

## Scoring and Logic Ownership
All scoring logic should live in backend functions rather than only in the client.

Why:
- prevents exposing critical logic unnecessarily
- keeps results consistent across web, PWA, and future tools
- makes changes easier to manage centrally
- supports future clinician-facing or admin-facing features

Frontend responsibilities:
- display questions
- collect responses
- show progress
- render results and pathway cards

Backend responsibilities:
- store submissions
- calculate scores
- apply overrides
- assign pathways
- store results and history

## Data Security Principles
The live system should not rely on spreadsheets as the primary data store.

Spreadsheets are useful for:
- drafting questions
- exporting data for review
- planning survey content
- internal audits

Convex should be the live source of truth for:
- users
- survey submissions
- results
- progress history
- pathway assignments

## Deployment Model
### Frontend deployment
- frontend repo connected to Netlify
- deploys triggered by Git pushes
- environment variables configured in Netlify

### Backend deployment
- Convex project configured separately
- Convex deployment linked to production environment
- Netlify frontend points to Convex deployment URL

## Content Strategy Model
The system should separate content from logic whenever practical.

### Content examples
- question text
- answer labels
- pathway descriptions
- results-page copy
- report copy

### Logic examples
- score mapping
- overrides
- route assignment
- risk band calculation

This allows non-developers to revise assessment wording without rewriting core logic.

## PWA Considerations
The app should support:
- mobile-friendly layouts
- app-like navigation
- installability where relevant
- persistent login
- saved user progress
- lightweight performance

## Recommended Build Strategy
### Phase 1
- public entry pages
- catabolic crisis screen
- main scorecard
- scoring engine
- results page
- account creation

### Phase 2
- saved dashboard
- reassessment engine
- pathway library
- PDF or report generation

### Phase 3
- lesson routing
- action planning
- progress visualizations
- cohort or population reporting

## Final Recommendation
Use:
- Netlify for frontend hosting
- React/Vite for the PWA experience
- Convex for backend and database
- Clerk for authentication
- Markdown docs in the repo for architecture, schema, and roadmap

This is the most practical combination for launching a secure assessment-based Muscle-Meta platform that can grow into a larger personalized health education and tracking system.
