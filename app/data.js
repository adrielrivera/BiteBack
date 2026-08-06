/* =============================================================================
   BiteBack — data.js
   -----------------------------------------------------------------------------
   THIS IS THE ONLY FILE THE TEAM NEEDS TO EDIT WHEN REAL OBSERVATION DATA
   IS COLLECTED. Every number below is a PLACEHOLDER DEMO ESTIMATE.

   Nothing here is measured. Nothing here comes from a real camera.
   See DATA_NOTES.md for what must be replaced and how.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   1. SCENARIO
   This proof-of-concept supports ONE user, ONE journey, ONE outcome.
   -------------------------------------------------------------------------- */
const SCENARIO = {
  startBlock: "Block 7",
  foodCourt: "Food Club",
  nextLessonBlock: "Block 37",
  // Locked because this prototype only models this single journey.
  locked: true,
};

/* -----------------------------------------------------------------------------
   2. TIMING PLACEHOLDERS (minutes)
   REPLACE AFTER REAL STOPWATCH OBSERVATION — see DATA_NOTES.md
   -------------------------------------------------------------------------- */
const TIMINGS = {
  walkStartToCourt: 6, // Block 7  -> Food Club       (PLACEHOLDER)
  queueMinutes: 9, // Chicken Rice queue wait     (PLACEHOLDER)
  prepMinutes: 4, // Chicken Rice preparation    (PLACEHOLDER)
  walkCourtToLesson: 6, // Food Club -> Block 37       (PLACEHOLDER)

  // Rule thresholds — these are TEAM DECISIONS, not observations.
  minEatingMinutes: 15, // Minimum acceptable eating time
  safetyBufferMinutes: 10, // Safety buffer for crowding / lift queues / spills
};

// Base non-eating time = the four journey legs added together.
// Computed, never hard-coded, so editing any leg above stays consistent.
// With the current placeholders this equals 25 minutes.
TIMINGS.baseNonEatingMinutes =
  TIMINGS.walkStartToCourt +
  TIMINGS.queueMinutes +
  TIMINGS.prepMinutes +
  TIMINGS.walkCourtToLesson;

/* -----------------------------------------------------------------------------
   3. DATA FRESHNESS RULE
   A queue snapshot older than this is treated as STALE -> result is Unknown.
   The prototype never guesses when data is missing or old.
   -------------------------------------------------------------------------- */
const MAX_SNAPSHOT_AGE_MINUTES = 10;

/* -----------------------------------------------------------------------------
   4. SIMULATED CV QUEUE SNAPSHOTS  (NOT REAL — NO CAMERA IS CONNECTED)
   These stand in for what a future computer-vision people-counter might report.
   `queueCount`   = simulated number of people seen in the queue
   `queueMinutes` = simulated estimated wait (null = data unavailable)
   `snapshotAgeMinutes` = how old the simulated snapshot is
   `fullCalculation` = true only for the one stall this PoC fully models
   -------------------------------------------------------------------------- */
const STALLS = [
  { id: "chicken-rice", name: "Chicken Rice", queueCount: 12, queueMinutes: 9, snapshotAgeMinutes: 2, fullCalculation: true },
  { id: "mothers-rice-bowl", name: "Mother's Rice Bowl", queueCount: 7, queueMinutes: 5, snapshotAgeMinutes: 2, fullCalculation: false },
  { id: "waizhai-vegetarian", name: "Waizhai Vegetarian", queueCount: 4, queueMinutes: 3, snapshotAgeMinutes: 3, fullCalculation: false },
  { id: "baba-remzi", name: "Baba Remzi", queueCount: 10, queueMinutes: 8, snapshotAgeMinutes: 2, fullCalculation: false },
  { id: "smooy", name: "Smöoy", queueCount: 3, queueMinutes: 2, snapshotAgeMinutes: 4, fullCalculation: false },
  { id: "indonesian", name: "Indonesian", queueCount: 6, queueMinutes: 5, snapshotAgeMinutes: 3, fullCalculation: false },
  { id: "japanese-cuisine", name: "Japanese Cuisine", queueCount: 14, queueMinutes: 11, snapshotAgeMinutes: 2, fullCalculation: false },
  { id: "korean-food", name: "Korean Food", queueCount: 9, queueMinutes: 7, snapshotAgeMinutes: 5, fullCalculation: false },
  { id: "mala-xiang-guo", name: "Mala Xiang Guo", queueCount: 16, queueMinutes: 13, snapshotAgeMinutes: 1, fullCalculation: false },
  { id: "western-food", name: "Western Food", queueCount: 11, queueMinutes: 10, snapshotAgeMinutes: 3, fullCalculation: false },
  // Deliberate demo case: snapshot exists but the wait could not be estimated.
  { id: "waffles-and-dessert", name: "Waffles and Dessert", queueCount: 5, queueMinutes: null, snapshotAgeMinutes: 4, fullCalculation: false },
  { id: "noodle", name: "Noodle", queueCount: 8, queueMinutes: 6, snapshotAgeMinutes: 2, fullCalculation: false },
  // Deliberate demo case: snapshot is older than MAX_SNAPSHOT_AGE_MINUTES.
  { id: "drinks-and-fresh-fruit", name: "Drinks and Fresh Fruit", queueCount: 2, queueMinutes: 2, snapshotAgeMinutes: 26, fullCalculation: false },
];

/* -----------------------------------------------------------------------------
   5. DEMO MODE DEFAULTS
   Fixed clock so the team gets identical, predictable results during the viva.
   1:00 PM now + 1:50 PM lesson -> 50 available - 25 base - 10 buffer = 15 -> Feasible
   -------------------------------------------------------------------------- */
const DEMO_DEFAULTS = {
  demoCurrentTime: "13:00", // 1:00 PM
  demoLessonTime: "13:50", // 1:50 PM
};

/* Expose to the browser. No modules, no bundler, no dependencies. */
window.BITEBACK_DATA = {
  SCENARIO,
  TIMINGS,
  MAX_SNAPSHOT_AGE_MINUTES,
  STALLS,
  DEMO_DEFAULTS,
};
