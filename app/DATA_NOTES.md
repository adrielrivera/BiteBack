# DATA_NOTES.md — every placeholder value and how to replace it

**Pillar:** Analytics
**Rule:** every number in this prototype is an unverified placeholder until this file says otherwise.

> **Nothing in BiteBack has been measured yet.** No stopwatch has been used at Food Club. No camera counts anyone. Every value below is a reasonable guess written by the team so the prototype has something to compute with. This file exists so an assessor, a tutor or a future teammate can tell exactly which numbers are real and which are not.

---

## 1. Where the numbers live

Every placeholder is in **one file: `data.js`**. No number is duplicated anywhere else in the codebase.

That is deliberate. When real observations arrive, the team edits `data.js` and nothing else. The rule in `feasibility.js` and the screens in `app.js` do not change at all.

---

## 2. Journey timings — `TIMINGS` in `data.js`

| Key | Value | Status | How to replace it |
|---|---|---|---|
| `walkStartToCourt` | **6 min** | ⚠️ Placeholder | Stopwatch, Block 7 exit → joining the Food Club queue. **≥ 10 walks**, spread across peak (12:00–13:30) and off-peak. Record the **median**, not the fastest. |
| `queueMinutes` | **9 min** | ⚠️ Placeholder | Stopwatch, joining the Chicken Rice queue → reaching the counter. **≥ 15 observations**, at least 5 during the 12:00–13:00 peak. |
| `prepMinutes` | **4 min** | ⚠️ Placeholder | Stopwatch, order placed → food in hand. **≥ 15 observations.** Note separately whether it varies by dish. |
| `walkCourtToLesson` | **6 min** | ⚠️ Placeholder | Stopwatch, leaving Food Club with a tray → seated in the Block 37 room. **Must include lift/stair waiting time**, which is easy to forget and is often the largest hidden delay. |
| `baseNonEatingMinutes` | **25 min** | ✅ Computed | Do **not** edit. It is the sum of the four rows above and recalculates itself. |

### Where 6 / 9 / 4 / 6 came from

They came from the team's own rough sense of campus distances and lunchtime queues. They are **not** derived from any survey, dataset, official NP source or published research. Saying this plainly is more useful than inventing a source.

---

## 3. Threshold decisions — also in `TIMINGS`

These are **team judgements**, not measurements. They should be justified in the report rather than "collected".

| Key | Value | Status | What must be justified |
|---|---|---|---|
| `minEatingMinutes` | **15 min** | ⚠️ Team assumption | Is 15 minutes actually enough to eat a plate of chicken rice without rushing? Test with **≥ 10 students**: time them eating a normal meal and take the median. |
| `safetyBufferMinutes` | **10 min** | ⚠️ Team assumption | Covers a longer-than-usual queue, a slow lift, a dropped tray, a toilet stop. Ideally derived from the **spread** of the observations above (e.g. the difference between the median and the 90th-percentile walk time), not chosen because it is a round number. |
| `MAX_SNAPSHOT_AGE_MINUTES` | **10 min** | ⚠️ Team assumption | How fast does a Food Club queue actually change? If a queue can double in 5 minutes, this limit is too generous and should be reduced. |

> The buffer is the single value that most changes the answer. Changing it from 10 to 5 turns several **Risky** results into **Feasible**. It should be the most carefully defended number in the report.

---

## 4. Simulated CV queue snapshots — `STALLS` in `data.js`

**None of this is real. No camera is connected to this prototype.**

Each stall carries four fields:

| Field | Meaning | Status |
|---|---|---|
| `queueCount` | Simulated number of people seen queueing | ⚠️ Hand-written |
| `queueMinutes` | Simulated estimated wait (`null` = unavailable) | ⚠️ Hand-written |
| `snapshotAgeMinutes` | How old the simulated snapshot is | ⚠️ Hand-written |
| `fullCalculation` | Whether this stall is fully modelled | ✅ Scope decision, not data |

### Current simulated values

| Stall | Queue count | Est. wait | Snapshot age | Why this value |
|---|---|---|---|---|
| Mother's Rice Bowl | 7 | 5 min | 2 min | Ordinary short queue |
| Waizhai Vegetarian | 4 | 3 min | 3 min | Quiet stall |
| Baba Remzi | 10 | 8 min | 2 min | Medium queue |
| **Chicken Rice** | **12** | **9 min** | **2 min** | **The one modelled stall** |
| Smöoy | 3 | 2 min | 4 min | Dessert, quick |
| Indonesian | 6 | 5 min | 3 min | Ordinary |
| Japanese Cuisine | 14 | 11 min | 2 min | Popular, long queue |
| Korean Food | 9 | 7 min | 5 min | Medium |
| Mala Xiang Guo | 16 | 13 min | 1 min | Longest queue — weighed to order |
| Western Food | 11 | 10 min | 3 min | Cooked to order |
| Waffles and Dessert | 5 | **null** | 4 min | **Deliberate demo case:** people counted but wait not estimable → "No wait estimate" |
| Noodle | 8 | 6 min | 2 min | Ordinary |
| Drinks and Fresh Fruit | 2 | **2 min** | **26 min** | **Deliberate demo case:** snapshot older than the 10-minute limit → "Stale snapshot" |

The last two rows exist so the "we do not guess" behaviour can be demonstrated on screen. Keep them, and say in the demo that they were built in on purpose.

### To replace with real data

**Manual counting (realistic for this module):** two students at Food Club with a phone timer. Every 10 minutes across a lunch period, record the time, the stall, the number of people queueing, and how long the last person in line took to reach the counter. That yields a real `people → minutes` relationship instead of the guessed one used here.

**Actual computer vision (out of scope):** would require a camera, a location permission, and — because it captures identifiable people — a PDPA assessment covering lawful basis, notification, retention and deletion. This is exactly why the prototype simulates it instead. Say this in the viva; it is a LegalTech point, not just a technical shortcut.

---

## 5. Demo mode values — `DEMO_DEFAULTS`

| Key | Value | Purpose |
|---|---|---|
| `demoCurrentTime` | `13:00` (1:00 PM) | Fixed clock so viva results are identical every run |
| `demoLessonTime` | `13:50` (1:50 PM) | Produces the headline **Feasible** result: 50 − 25 − 10 = 15 |

These are **presentation choices**, not data. They do not need replacing — but the app must also be shown in **Device time** mode so nobody thinks the whole thing only works with a rigged clock.

---

## 6. Replacement checklist

- [ ] Measure `walkStartToCourt` (≥ 10 walks, peak and off-peak, median)
- [ ] Measure `queueMinutes` for Chicken Rice (≥ 15 observations, ≥ 5 at peak)
- [ ] Measure `prepMinutes` for Chicken Rice (≥ 15 observations)
- [ ] Measure `walkCourtToLesson` **including lift waiting time** (≥ 10 walks)
- [ ] Test `minEatingMinutes` with ≥ 10 students eating a normal meal
- [ ] Derive `safetyBufferMinutes` from the spread of the walk and queue observations
- [ ] Decide `MAX_SNAPSHOT_AGE_MINUTES` from how fast queues actually change
- [ ] Count real queue lengths for all 13 stalls at a fixed time of day
- [ ] Record **date, time, weather and who measured** for every observation
- [ ] Update `data.js` and change every ⚠️ in this file to ✅ with its source
- [ ] Re-run every case in `TEST_CASES.md` — the expected results in Groups A–C **will change** when the timings change, and that is correct

---

## 7. Honest limitations of the data model

1. **One walking pace for everyone.** No allowance for mobility differences, crowding, or carrying a full tray.
2. **Queue length is not queue time.** Twelve people at a fast stall may clear sooner than six at a slow one. The current model treats a wait estimate as given rather than derived from the count.
3. **A snapshot is a moment, not a forecast.** The queue can grow while the student walks over. BiteBack does not predict that.
4. **Weather and timetable clashes are ignored.** Rain and a lecture ending nearby both change queues sharply.
5. **Small samples.** Even the recommended sample sizes above are small. The result should always be presented as an estimate — which is why the app never says "you will make it", only "Feasible".
