# TEST_CASES.md — TDD RED set for the BiteBack feasibility rule

**Pillar:** Software Engineering
**Unit under test:** `evaluateTrip()` in `feasibility.js`
**Status of this set:** written as **RED** — the expected results were agreed *before* the implementation was trusted.

---

## 1. What is being tested

One thing only: **the feasibility decision rule**. Not the layout, not the colours, not the browser.

`evaluateTrip()` was deliberately written as a **pure function** — it reads no clock, touches no HTML and stores nothing — so every case below can be checked with fixed inputs and always gives the same answer.

### Inputs

| Input | Meaning |
|---|---|
| `nowMinutes` | Current time as minutes after midnight (13:00 → 780) |
| `lessonMinutes` | Next lesson start time, same units (`null` if missing) |
| `stall` | The selected stall object, including `queueMinutes` and `snapshotAgeMinutes` |
| `timings` | The `TIMINGS` object from `data.js` |
| `maxSnapshotAgeMinutes` | Freshness limit — currently 10 |

### Fixed values used by every case below

```
walk Block 7 → Food Club   = 6 min
Chicken Rice queue         = 9 min
Chicken Rice preparation   = 4 min
walk Food Club → Block 37  = 6 min
------------------------------------
base non-eating time       = 25 min
minimum eating time        = 15 min
safety buffer              = 10 min
max snapshot age           = 10 min
```

---

## 2. The PASS/FAIL rule

A test case **PASSES** when the returned `status` **exactly equals** the expected status, **and** — where the case specifies numbers — `eatingBeforeBuffer` and `eatingAfterBuffer` match exactly.

Anything else is a **FAIL**, including:

- the right number with the wrong status label,
- a computed status where the case expects `UNKNOWN`,
- a thrown error or a crash,
- a blank or partly filled result.

**Guessing counts as failing.** If required data is missing or stale, the only acceptable answer is `UNKNOWN`.

### Decision rule under test

```
1. lesson time missing / invalid / not later than now  → INPUT_REJECTED
2. stall not modelled                                  → QUEUE_COMPARISON_ONLY
3. required timing missing / snapshot stale            → UNKNOWN
4. available        = lesson − now
   base             = walk1 + queue + prep + walk2
   eatingBefore     = available − base
   eatingAfter      = eatingBefore − buffer
5. eatingBefore < 15                                   → NOT_FEASIBLE
   eatingAfter  < 15                                   → RISKY
   otherwise                                           → FEASIBLE
```

Order matters: validation before data checks, data checks before arithmetic, `NOT_FEASIBLE` before `RISKY`. Reordering steps 5a and 5b would silently mislabel every "Not feasible" case as "Risky".

---

## 3. The test cases

`now` is 1:00 PM (780) in every case unless stated otherwise.

### Group A — the core happy path

| # | Case | Lesson time | Available | Eat before | Eat after | Expected |
|---|---|---|---|---|---|---|
| A1 | The demo case | 1:50 PM | 50 | 25 | 15 | **FEASIBLE** |
| A2 | Long break | 2:30 PM | 90 | 65 | 55 | **FEASIBLE** |
| A3 | Exact boundary — after-buffer lands on 15 | 1:50 PM | 50 | 25 | 15 | **FEASIBLE** |

> A3 is the most important case in the set. It sits exactly on the `≥ 15` line. If the code ever uses `> 15` instead of `>= 15`, only this case catches it.

### Group B — Risky band

| # | Case | Lesson time | Available | Eat before | Eat after | Expected |
|---|---|---|---|---|---|---|
| B1 | One minute below the buffer line | 1:49 PM | 49 | 24 | 14 | **RISKY** |
| B2 | Middle of the risky band | 1:45 PM | 45 | 20 | 10 | **RISKY** |
| B3 | Bottom boundary — before-buffer exactly 15 | 1:40 PM | 40 | 15 | 5 | **RISKY** |

> B3 is the lower edge of Risky. One minute earlier (1:39 PM) must flip to Not feasible. B3 and C1 together fence the boundary from both sides.

### Group C — Not feasible band

| # | Case | Lesson time | Available | Eat before | Eat after | Expected |
|---|---|---|---|---|---|---|
| C1 | One minute below the Risky floor | 1:39 PM | 39 | 14 | 4 | **NOT_FEASIBLE** |
| C2 | Barely enough time to walk and queue | 1:26 PM | 26 | 1 | −9 | **NOT_FEASIBLE** |
| C3 | Not even enough for the journey itself | 1:10 PM | 10 | −15 | −25 | **NOT_FEASIBLE** |

> C3 checks that negative eating time is handled as a normal Not-feasible answer, not as an error or a crash.

### Group D — Input rejected

| # | Case | Input | Expected status | Expected reason |
|---|---|---|---|---|
| D1 | Lesson time left empty | `lessonMinutes = null` | **INPUT_REJECTED** | `LESSON_TIME_MISSING` |
| D2 | Lesson time already passed | 12:30 PM | **INPUT_REJECTED** | `LESSON_TIME_NOT_IN_FUTURE` |
| D3 | Lesson time equals current time | 1:00 PM | **INPUT_REJECTED** | `LESSON_TIME_NOT_IN_FUTURE` |
| D4 | Nonsense time string `"25:00"` | parses to `null` | **INPUT_REJECTED** | `LESSON_TIME_MISSING` |

> D3 is the "not later than" boundary — zero minutes available is not a valid trip, so `<=` is required, not `<`.

### Group E — Unknown (missing, stale or unusable data)

| # | Case | Input | Expected status | Expected reason |
|---|---|---|---|---|
| E1 | Queue wait unavailable | `stall.queueMinutes = null` | **UNKNOWN** | `TIMING_DATA_MISSING` |
| E2 | Snapshot 26 minutes old (limit is 10) | `snapshotAgeMinutes = 26` | **UNKNOWN** | `SNAPSHOT_STALE` |
| E3 | Snapshot age itself unknown | `snapshotAgeMinutes = null` | **UNKNOWN** | `SNAPSHOT_AGE_UNKNOWN` |
| E4 | Walking time missing from config | `walkCourtToLesson = null` | **UNKNOWN** | `TIMING_DATA_MISSING` |
| E5 | No stall selected | `stall = null` | **UNKNOWN** | `NO_STALL_SELECTED` |
| E6 | Snapshot exactly at the limit | `snapshotAgeMinutes = 10` | **FEASIBLE** *(not Unknown)* | data is still fresh at exactly 10 |

> E6 is the freshness boundary. The rule is "older **than** 10 is stale", so exactly 10 must still compute. Without E6, an off-by-one in the staleness check would go unnoticed.

### Group F — Unsupported stall

| # | Case | Input | Expected |
|---|---|---|---|
| F1 | Noodle stall selected | `fullCalculation = false` | **QUEUE_COMPARISON_ONLY** |
| F2 | Mala Xiang Guo selected | `fullCalculation = false` | **QUEUE_COMPARISON_ONLY** |
| F3 | Unsupported stall **and** an invalid lesson time | Noodle, lesson 12:30 PM | **INPUT_REJECTED** *(validation runs first)* |

> F3 checks the order of the rule, not just the outcome. Bad input is reported before scope limits, so the student is told the fixable problem first.

---

## 4. How to run the set

Open the app, press `F12` → **Console**, then paste:

```js
const { evaluateTrip, timeStringToMinutes: t } = BITEBACK_LOGIC;
const { TIMINGS, STALLS, MAX_SNAPSHOT_AGE_MINUTES } = BITEBACK_DATA;
const cr = () => ({ ...STALLS.find(s => s.id === 'chicken-rice') });

const run = (over = {}) => evaluateTrip({
  nowMinutes: t('13:00'),
  lessonMinutes: t('13:50'),
  stall: cr(),
  timings: TIMINGS,
  maxSnapshotAgeMinutes: MAX_SNAPSHOT_AGE_MINUTES,
  ...over
});

console.log('A1', run().status, run().eatingAfterBuffer);              // FEASIBLE 15
console.log('B1', run({ lessonMinutes: t('13:49') }).status);          // RISKY
console.log('B3', run({ lessonMinutes: t('13:40') }).status);          // RISKY
console.log('C1', run({ lessonMinutes: t('13:39') }).status);          // NOT_FEASIBLE
console.log('D2', run({ lessonMinutes: t('12:30') }).reason);          // LESSON_TIME_NOT_IN_FUTURE
console.log('D3', run({ lessonMinutes: t('13:00') }).reason);          // LESSON_TIME_NOT_IN_FUTURE
console.log('E1', run({ stall: { ...cr(), queueMinutes: null } }).reason);      // TIMING_DATA_MISSING
console.log('E2', run({ stall: { ...cr(), snapshotAgeMinutes: 26 } }).reason);  // SNAPSHOT_STALE
console.log('E6', run({ stall: { ...cr(), snapshotAgeMinutes: 10 } }).status);  // FEASIBLE
console.log('F1', run({ stall: STALLS.find(s => s.id === 'noodle') }).status);  // QUEUE_COMPARISON_ONLY
```

The **Demo controls** section on the input screen reproduces E1 and E2 through the interface, so the Unknown state can also be demonstrated without opening the console.

---

## 5. What this set deliberately does not cover

Stating the gaps is part of the honesty of the test set:

- **Accuracy of the placeholder numbers.** These tests prove the *arithmetic* is right. They cannot prove 6 minutes is really how long the walk takes — only stopwatch observation can (see `DATA_NOTES.md`).
- **Journeys crossing midnight.** Out of scope; NP lessons do not.
- **Browser and layout behaviour.** Checked by hand in a mobile viewport, not by these cases.
- **Real computer-vision accuracy.** No camera exists in this prototype.
