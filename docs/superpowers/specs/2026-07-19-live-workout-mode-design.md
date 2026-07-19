# Live Workout Mode Design Spec

## Overview
A mobile-optimized, in-gym live workout companion for Fitoholic. It allows users to actively track sets, weights, and reps during a training session with an aesthetic, distraction-free "Full List" interface and a hybrid count-up rest timer.

## Core Workflows
1. **Initiation:** Users can launch a Live Session from a scheduled workout plan or start an empty ad-hoc session.
2. **Execution:** Users see a full scrollable list of exercises. They tap a checkbox/circle to log a set as complete.
3. **Pacing (Hybrid):** Upon completing a set, a subtle count-up stopwatch begins tracking rest time. The timer automatically resets to zero when the user completes their next set. No forced alarms or full-screen takeovers.
4. **Flexibility:** Users can tap "Add Exercise" to open a modal that searches the master database (API integration). Selecting an exercise appends it to the live session. Users can also swipe to delete exercises they decide to skip.
5. **Completion/Abandonment:** 
   - Clicking "Finish Workout" finalizes the session, persists it to the database, and redirects the user to the dashboard.
   - Clicking "Cancel" prompts the user to either "Save as Incomplete" (sends payload) or "Discard" (clears local state without saving).

## Data & State Architecture
- **Client-Side State & Local Persistence:** The active workout state (completed sets, modified exercises, active timer) will be managed using **Zustand** with its `persist` middleware (saving to `localStorage`). This ensures that an accidental browser refresh, backward navigation, or mobile OS tab suspension will *not* wipe out the user's in-progress workout.
- **Server Persistence:** The final payload (Workout + Exercises + Sets) is sent to a single API route (`POST /api/workouts/live`) upon completion to prevent excessive network calls during the workout.
- **Data Models (Prisma):** Will utilize the existing `Workout`, `WorkoutExercise`, and `WorkoutSet` models (or similar, depending on the schema structure for Phase 2).

## UI/UX Approach
- **Layout:** The "Full List" layout. Exercises are stacked vertically.
- **Aesthetic:** Adheres to Zenith Editorial guidelines (`editorial-card`, `material-symbols-outlined`, hairline 1px borders, `Playfair Display` headers).
- **Interactions:** Subtle haptic-style micro-animations (e.g., `active:scale-[0.99]`) when completing sets.

## Scope Boundaries
- **In Scope:** Tracking sets, weights, reps; hybrid count-up timer; adding/removing exercises; saving the workout.
- **Out of Scope (for this phase):** Live heart rate integrations (Apple HealthKit/Google Fit APIs), social sharing of the live session, push notifications for the timer.
