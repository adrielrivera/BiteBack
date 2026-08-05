/* =============================================================================
   BiteBack — app.js
   -----------------------------------------------------------------------------
   Screen wiring only. All decision logic lives in feasibility.js and all
   numbers live in data.js, so this file can be skimmed quickly during a viva.

   Deliberately NOT here: localStorage, sessionStorage, cookies, fetch/XHR,
   analytics, service workers. Everything is held in memory for the session and
   disappears when the tab closes.
   ============================================================================= */

(function () {
  "use strict";

  const { SCENARIO, TIMINGS, MAX_SNAPSHOT_AGE_MINUTES, STALLS, DEMO_DEFAULTS } = window.BITEBACK_DATA;
  const { RESULT, evaluateTrip, timeStringToMinutes, minutesToDisplayTime } = window.BITEBACK_LOGIC;

  const $ = (id) => document.getElementById(id);

  /* In-memory session state. Never persisted. */
  const state = {
    lessonMinutes: null,
    lessonRaw: "",
  };

  /* -------------------------------------------------------------------------
     Clock helpers
     ---------------------------------------------------------------------- */
  function getTimeMode() {
    const checked = document.querySelector('input[name="time-mode"]:checked');
    return checked ? checked.value : "demo";
  }

  function getNowMinutes() {
    if (getTimeMode() === "demo") {
      return timeStringToMinutes($("demo-current-time").value || DEMO_DEFAULTS.demoCurrentTime);
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /* -------------------------------------------------------------------------
     Simulated CV snapshot access
     Returns a COPY of the stall so the demo switches never corrupt data.js.
     ---------------------------------------------------------------------- */
  function getStall(id) {
    const original = STALLS.find((s) => s.id === id);
    if (!original) return null;
    const stall = Object.assign({}, original);

    if (id === "chicken-rice") {
      if ($("simulate-missing").checked) stall.queueMinutes = null; // data unavailable
      if ($("simulate-stale").checked) stall.snapshotAgeMinutes = 26; // older than the limit
    }
    return stall;
  }

  function snapshotStatus(stall) {
    if (stall.queueMinutes === null || stall.queueMinutes === undefined) {
      return { cls: "data-missing", icon: "?", text: "No wait estimate" };
    }
    if (stall.snapshotAgeMinutes > MAX_SNAPSHOT_AGE_MINUTES) {
      return { cls: "data-stale", icon: "!", text: `Stale snapshot (${stall.snapshotAgeMinutes} min old)` };
    }
    return { cls: "data-fresh", icon: "✓", text: `Snapshot ${stall.snapshotAgeMinutes} min ago` };
  }

  function loadBand(minutes) {
    if (minutes === null || minutes === undefined) return { cls: "load-none", text: "No data" };
    if (minutes <= 5) return { cls: "load-short", text: "Short queue" };
    if (minutes <= 10) return { cls: "load-medium", text: "Medium queue" };
    return { cls: "load-long", text: "Long queue" };
  }

  /* -------------------------------------------------------------------------
     Navigation
     ---------------------------------------------------------------------- */
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((section) => {
      const active = section.id === id;
      section.classList.toggle("is-active", active);
      section.hidden = !active;
    });
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------------------------
     Screen 1 — input
     ---------------------------------------------------------------------- */
  function refreshNowReadout() {
    const nowMinutes = getNowMinutes();
    const mode = getTimeMode() === "demo" ? "demo clock" : "device clock";
    $("now-readout").textContent = `${minutesToDisplayTime(nowMinutes)} (${mode})`;
    $("demo-time-field").hidden = getTimeMode() !== "demo";
  }

  function showLessonTimeError(message) {
    const box = $("lesson-time-error");
    const input = $("lesson-time");
    if (!message) {
      box.hidden = true;
      box.textContent = "";
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      return;
    }
    box.hidden = false;
    box.textContent = message;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const raw = $("lesson-time").value;
    const lessonMinutes = timeStringToMinutes(raw);
    const nowMinutes = getNowMinutes();

    /* Validate using the same rule engine the result screen uses, so the
       error messages and the result can never drift apart. */
    const probe = evaluateTrip({
      nowMinutes,
      lessonMinutes,
      stall: getStall("chicken-rice"),
      timings: TIMINGS,
      maxSnapshotAgeMinutes: MAX_SNAPSHOT_AGE_MINUTES,
    });

    if (probe.status === RESULT.INPUT_REJECTED) {
      if (probe.reason === "LESSON_TIME_MISSING" || probe.reason === "LESSON_TIME_INVALID") {
        showLessonTimeError("Enter the time your next lesson starts, for example 1:50 PM.");
      } else if (probe.reason === "LESSON_TIME_NOT_IN_FUTURE") {
        showLessonTimeError(
          `That time is not in the future. The current time in use is ${minutesToDisplayTime(nowMinutes)}.`
        );
      } else {
        showLessonTimeError("The current time could not be read. Check the demo clock value.");
      }
      return;
    }

    showLessonTimeError(null);
    state.lessonMinutes = lessonMinutes;
    state.lessonRaw = raw;

    renderQueueScreen();
    showScreen("screen-queue");
  }

  /* -------------------------------------------------------------------------
     Screen 2 — queues
     ---------------------------------------------------------------------- */
  function renderQueueScreen() {
    const nowMinutes = getNowMinutes();
    const arrival = nowMinutes + TIMINGS.walkStartToCourt;
    $("queue-context").textContent =
      `Leaving ${SCENARIO.startBlock} at ${minutesToDisplayTime(nowMinutes)} · ` +
      `at ${SCENARIO.foodCourt} about ${minutesToDisplayTime(arrival)} · ` +
      `lesson ${minutesToDisplayTime(state.lessonMinutes)} at ${SCENARIO.nextLessonBlock}`;

    const list = $("stall-list");
    list.textContent = "";

    STALLS.forEach((base) => {
      const stall = getStall(base.id);
      const status = snapshotStatus(stall);
      const band = loadBand(stall.queueMinutes);

      const li = document.createElement("li");
      li.className = "stall" + (stall.fullCalculation ? " stall-featured" : "");

      const top = document.createElement("div");
      top.className = "stall-top";

      const name = document.createElement("p");
      name.className = "stall-name";
      name.textContent = stall.name;

      const load = document.createElement("span");
      load.className = "queue-load " + band.cls;
      load.textContent = band.text;

      top.append(name, load);

      const stats = document.createElement("p");
      stats.className = "stall-stats";
      const waitText = stall.queueMinutes === null ? "not available" : `${stall.queueMinutes} min`;
      stats.innerHTML =
        `Simulated queue: <strong>${stall.queueCount} people</strong> · ` +
        `Est. wait: <strong>${waitText}</strong>`;

      const badge = document.createElement("span");
      badge.className = "data-status " + status.cls;
      badge.textContent = `${status.icon} ${status.text}`;

      li.append(top, stats, badge);

      if (stall.fullCalculation) {
        const wrap = document.createElement("div");
        wrap.className = "stall-action";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-primary";
        btn.textContent = "Check if I have time for Chicken Rice";
        btn.addEventListener("click", () => {
          renderResultScreen();
          showScreen("screen-result");
        });
        wrap.append(btn);
        li.append(wrap);
      } else {
        const note = document.createElement("p");
        note.className = "stall-note";
        note.textContent = "Queue comparison only. Full timing calculation not available in this prototype.";
        li.append(note);
      }

      list.append(li);
    });
  }

  /* -------------------------------------------------------------------------
     Screen 3 — result
     ---------------------------------------------------------------------- */
  const PRESENTATION = {
    [RESULT.FEASIBLE]: {
      cls: "is-feasible",
      icon: "✓",
      label: "Feasible",
      line: "You should have enough time, including the safety buffer.",
    },
    [RESULT.RISKY]: {
      cls: "is-risky",
      icon: "!",
      label: "Risky",
      line: "It only works if nothing goes wrong. No spare time left.",
    },
    [RESULT.NOT_FEASIBLE]: {
      cls: "is-not-feasible",
      icon: "✕",
      label: "Not feasible",
      line: "There is not enough time to eat properly and still arrive on time.",
    },
    [RESULT.UNKNOWN]: {
      cls: "is-unknown",
      icon: "?",
      label: "Unknown",
      line: "BiteBack will not guess when the data is missing or out of date.",
    },
  };

  function explain(result) {
    const min = TIMINGS.minEatingMinutes;
    const buffer = TIMINGS.safetyBufferMinutes;

    switch (result.status) {
      case RESULT.FEASIBLE:
        return (
          `You have ${result.availableMinutes} minutes before your lesson. Walking, queueing and waiting for ` +
          `food uses ${result.baseNonEatingMinutes} minutes, and the ${buffer} minute safety buffer is set aside for ` +
          `things going slightly wrong. That still leaves ${result.eatingAfterBuffer} minutes to eat, which meets ` +
          `the ${min} minute minimum. Go ahead.`
        );
      case RESULT.RISKY:
        return (
          `You have ${result.availableMinutes} minutes. On paper there are ${result.eatingBeforeBuffer} minutes to eat, ` +
          `which clears the ${min} minute minimum. But once the ${buffer} minute safety buffer is removed you are down to ` +
          `${result.eatingAfterBuffer} minutes. One longer queue, one slow lift or one spilled drink and you are late. ` +
          `Only do this if you can eat fast and leave immediately.`
        );
      case RESULT.NOT_FEASIBLE:
        return (
          `You have ${result.availableMinutes} minutes, but walking, queueing and waiting for food already uses ` +
          `${result.baseNonEatingMinutes} minutes. That leaves only ${result.eatingBeforeBuffer} minutes to eat, below the ` +
          `${min} minute minimum, even before any safety buffer. Consider a quicker stall, a takeaway, or eating after class.`
        );
      case RESULT.UNKNOWN:
        if (result.reason === "SNAPSHOT_STALE") {
          return (
            `The Chicken Rice queue snapshot is older than the ${MAX_SNAPSHOT_AGE_MINUTES} minute freshness limit, so the ` +
            `queue could have changed completely. BiteBack shows Unknown rather than a number it cannot stand behind.`
          );
        }
        if (result.reason === "TIMING_DATA_MISSING") {
          return (
            `At least one required timing value is missing, so the calculation cannot be completed. BiteBack shows ` +
            `Unknown instead of filling the gap with a guess.`
          );
        }
        return `Required data is missing or invalid, so no result can be given. Reason code: ${result.reason}.`;
      default:
        return `Reason code: ${result.reason}.`;
    }
  }

  function setText(id, value) {
    $(id).textContent = value === null || value === undefined ? "--" : String(value);
  }

  function renderResultScreen() {
    const nowMinutes = getNowMinutes();
    const stall = getStall("chicken-rice");

    const result = evaluateTrip({
      nowMinutes,
      lessonMinutes: state.lessonMinutes,
      stall,
      timings: TIMINGS,
      maxSnapshotAgeMinutes: MAX_SNAPSHOT_AGE_MINUTES,
    });

    /* Anything that is not a computed verdict is presented as Unknown, so the
       screen never shows a blank or a half-finished answer. */
    const view = PRESENTATION[result.status] || PRESENTATION[RESULT.UNKNOWN];

    const pill = $("status-pill");
    pill.className = "status-pill " + view.cls;
    $("status-icon").textContent = view.icon;
    $("status-label").textContent = view.label;
    $("status-line").textContent = view.line;

    $("result-context").textContent =
      `${SCENARIO.startBlock} → ${SCENARIO.foodCourt} → ${SCENARIO.nextLessonBlock} · ` +
      `now ${minutesToDisplayTime(nowMinutes)} · lesson ${minutesToDisplayTime(state.lessonMinutes)}`;

    const hasNumbers = result.breakdown !== null && result.breakdown !== undefined;

    setText("eat-before", hasNumbers ? result.eatingBeforeBuffer : "--");
    setText("eat-after", hasNumbers ? result.eatingAfterBuffer : "--");
    $("eat-rule").textContent = hasNumbers
      ? `Rule: at least ${TIMINGS.minEatingMinutes} minutes of eating time after the ${TIMINGS.safetyBufferMinutes} minute safety buffer.`
      : "No eating time can be calculated without complete queue and timing data.";

    setText("bd-walk1", hasNumbers ? result.breakdown.walkStartToCourt : "--");
    setText("bd-queue", hasNumbers ? result.breakdown.queueMinutes : "--");
    setText("bd-prep", hasNumbers ? result.breakdown.prepMinutes : "--");
    setText("bd-walk2", hasNumbers ? result.breakdown.walkCourtToLesson : "--");
    setText("bd-base", hasNumbers ? result.baseNonEatingMinutes : "--");
    setText("bd-buffer", hasNumbers ? result.breakdown.safetyBufferMinutes : "--");
    setText("bd-available", hasNumbers ? result.availableMinutes : "--");

    $("explain-text").textContent = explain(result);
  }

  /* -------------------------------------------------------------------------
     Wiring
     ---------------------------------------------------------------------- */
  function init() {
    $("lesson-time").value = DEMO_DEFAULTS.demoLessonTime;
    $("demo-current-time").value = DEMO_DEFAULTS.demoCurrentTime;

    $("trip-form").addEventListener("submit", handleSubmit);
    $("lesson-time").addEventListener("input", () => showLessonTimeError(null));

    document.querySelectorAll('input[name="time-mode"]').forEach((radio) => {
      radio.addEventListener("change", refreshNowReadout);
    });
    $("demo-current-time").addEventListener("input", refreshNowReadout);

    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-goto");
        if (target === "screen-queue") renderQueueScreen();
        showScreen(target);
      });
    });

    refreshNowReadout();
    /* Keep the device clock honest if the app sits open during a demo. */
    setInterval(() => {
      if (getTimeMode() === "device") refreshNowReadout();
    }, 15000);

    showScreen("screen-input");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
