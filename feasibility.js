/* =============================================================================
   BiteBack — feasibility.js
   -----------------------------------------------------------------------------
   The decision rule, kept separate from all screen code on purpose.

   Why it is separate (Software Engineering / TDD decision):
   - It is a PURE function: same inputs always give the same output.
   - It touches no HTML, no clock, no storage and no network.
   - That makes every row in TEST_CASES.md checkable without clicking the UI.

   Read this file together with TEST_CASES.md before the viva.
   ============================================================================= */

/* Result codes. Strings, so they are readable in the console during a demo. */
const RESULT = {
  FEASIBLE: "FEASIBLE",
  RISKY: "RISKY",
  NOT_FEASIBLE: "NOT_FEASIBLE",
  UNKNOWN: "UNKNOWN",
  INPUT_REJECTED: "INPUT_REJECTED",
  QUEUE_COMPARISON_ONLY: "QUEUE_COMPARISON_ONLY",
};

/**
 * Convert "HH:MM" into minutes after midnight.
 * Returns null for anything that is not a valid 24-hour time.
 */
function timeStringToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Convert minutes after midnight into a friendly "1:50 PM". */
function minutesToDisplayTime(totalMinutes) {
  if (totalMinutes === null || Number.isNaN(totalMinutes)) return "--:--";
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** A timing number is only usable if it is a real, non-negative number. */
function isUsableMinutes(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * evaluateTrip — the single decision rule for BiteBack.
 *
 * @param {object} input
 * @param {number}  input.nowMinutes      Current time, minutes after midnight.
 * @param {number|null} input.lessonMinutes Next lesson time, minutes after midnight (null if missing).
 * @param {object|null} input.stall       The selected stall object (null if none selected).
 * @param {object}  input.timings         The TIMINGS object from data.js.
 * @param {number}  input.maxSnapshotAgeMinutes Staleness limit for queue data.
 *
 * @returns {object} { status, reason, availableMinutes, baseNonEatingMinutes,
 *                     eatingBeforeBuffer, eatingAfterBuffer, breakdown }
 */
function evaluateTrip(input) {
  const {
    nowMinutes,
    lessonMinutes,
    stall,
    timings,
    maxSnapshotAgeMinutes,
  } = input;

  const empty = {
    availableMinutes: null,
    baseNonEatingMinutes: null,
    eatingBeforeBuffer: null,
    eatingAfterBuffer: null,
    breakdown: null,
  };

  /* --- Step 1: reject bad input before anything else ---------------------- */
  if (!isUsableMinutes(nowMinutes)) {
    return { status: RESULT.INPUT_REJECTED, reason: "CURRENT_TIME_INVALID", ...empty };
  }
  if (lessonMinutes === null || lessonMinutes === undefined || Number.isNaN(lessonMinutes)) {
    return { status: RESULT.INPUT_REJECTED, reason: "LESSON_TIME_MISSING", ...empty };
  }
  if (!isUsableMinutes(lessonMinutes)) {
    return { status: RESULT.INPUT_REJECTED, reason: "LESSON_TIME_INVALID", ...empty };
  }
  if (lessonMinutes <= nowMinutes) {
    return { status: RESULT.INPUT_REJECTED, reason: "LESSON_TIME_NOT_IN_FUTURE", ...empty };
  }

  /* --- Step 2: is this stall modelled at all? ----------------------------- */
  if (!stall) {
    return { status: RESULT.UNKNOWN, reason: "NO_STALL_SELECTED", ...empty };
  }
  if (!stall.fullCalculation) {
    return { status: RESULT.QUEUE_COMPARISON_ONLY, reason: "STALL_NOT_MODELLED", ...empty };
  }

  /* --- Step 3: refuse to guess when data is missing, stale or invalid ----- */
  const requiredTimings = [
    timings && timings.walkStartToCourt,
    stall.queueMinutes,
    timings && timings.prepMinutes,
    timings && timings.walkCourtToLesson,
  ];
  if (requiredTimings.some((value) => !isUsableMinutes(value))) {
    return { status: RESULT.UNKNOWN, reason: "TIMING_DATA_MISSING", ...empty };
  }
  if (!isUsableMinutes(stall.snapshotAgeMinutes)) {
    return { status: RESULT.UNKNOWN, reason: "SNAPSHOT_AGE_UNKNOWN", ...empty };
  }
  if (stall.snapshotAgeMinutes > maxSnapshotAgeMinutes) {
    return { status: RESULT.UNKNOWN, reason: "SNAPSHOT_STALE", ...empty };
  }

  /* --- Step 4: the arithmetic -------------------------------------------- */
  const availableMinutes = lessonMinutes - nowMinutes;

  const baseNonEatingMinutes =
    timings.walkStartToCourt +
    stall.queueMinutes +
    timings.prepMinutes +
    timings.walkCourtToLesson;

  const eatingBeforeBuffer = availableMinutes - baseNonEatingMinutes;
  const eatingAfterBuffer = eatingBeforeBuffer - timings.safetyBufferMinutes;

  const breakdown = {
    walkStartToCourt: timings.walkStartToCourt,
    queueMinutes: stall.queueMinutes,
    prepMinutes: timings.prepMinutes,
    walkCourtToLesson: timings.walkCourtToLesson,
    safetyBufferMinutes: timings.safetyBufferMinutes,
  };

  const numbers = {
    availableMinutes,
    baseNonEatingMinutes,
    eatingBeforeBuffer,
    eatingAfterBuffer,
    breakdown,
  };

  /* --- Step 5: apply the result rules in priority order ------------------- */
  if (eatingBeforeBuffer < timings.minEatingMinutes) {
    return { status: RESULT.NOT_FEASIBLE, reason: "EATING_TIME_TOO_SHORT", ...numbers };
  }
  if (eatingAfterBuffer < timings.minEatingMinutes) {
    return { status: RESULT.RISKY, reason: "ONLY_WORKS_WITHOUT_BUFFER", ...numbers };
  }
  return { status: RESULT.FEASIBLE, reason: "ENOUGH_TIME_WITH_BUFFER", ...numbers };
}

/* Expose for the browser. */
window.BITEBACK_LOGIC = {
  RESULT,
  evaluateTrip,
  timeStringToMinutes,
  minutesToDisplayTime,
  isUsableMinutes,
};
