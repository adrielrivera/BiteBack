# GENAI_DECLARATION_NOTES.md

Working notes for the team's GenAI declaration and PAIR evidence. Nothing here is a finished declaration — it is the honest record the team needs in order to write one and to answer viva questions without bluffing.

---

## 1. What AI was used for

An AI coding assistant (Claude, via a desktop agent) was given a written brief describing the problem, the user, the screens, the exact stall list, the placeholder timing values and the calculation rules. It produced a first working version of:

| File | AI contribution | What the team still owns |
|---|---|---|
| `index.html` | Full first draft of the three screens and wording | Every sentence shown to a user |
| `styles.css` | Full first draft of the mobile-first layout | Whether it is actually readable on a real phone |
| `data.js` | Structure of the data object | **Every number in it** — these came from the team's brief, and none are measured |
| `feasibility.js` | Full first draft of the decision function | Whether the rule matches what the team decided |
| `app.js` | Full first draft of the screen wiring | — |
| `README.md`, `TEST_CASES.md`, `DATA_NOTES.md` | Full first drafts | The test expectations and data claims must be checked, not assumed |

**Critically:** the problem, the user, the single-route scope, the four result states, the 15-minute eating minimum, the 10-minute safety buffer, the 10-minute freshness limit, the decision to collect no personal data, and the decision to show **Unknown** instead of guessing were all **specified by the team**. The AI implemented those decisions; it did not make them.

---

## 2. What the team must inspect before the viva

Assessors are allowed to ask about any line. Each item below should have a named owner who can explain it **without notes**.

### Must be able to explain line by line

- [ ] `feasibility.js` — the whole file. Especially **why validation runs before data checks**, and **why `NOT_FEASIBLE` is tested before `RISKY`**. (Swapping the last two would mislabel every Not-feasible case as Risky.)
- [ ] The `>= 15` comparisons — why "at least 15" and not "more than 15".
- [ ] `stall.snapshotAgeMinutes > maxSnapshotAgeMinutes` — why exactly 10 minutes old still counts as fresh.
- [ ] `timeStringToMinutes()` — why times are converted to minutes-after-midnight rather than compared as `Date` objects.
- [ ] The `getStall()` copy in `app.js` — why it returns a copy, so the demo switches cannot corrupt `data.js`.

### Must be able to justify as decisions

- [ ] Every number in `data.js` — and be ready to say plainly that **none of them are measured yet** (see `DATA_NOTES.md`).
- [ ] Why only Chicken Rice has the full calculation, and why the other twelve stalls honestly say so.
- [ ] Why there is no login, no location and no timetable upload.
- [ ] Why status is shown as **icon + word + colour** and never colour alone.

### Must be verified by hand, not trusted

- [ ] Run all 25 cases in `TEST_CASES.md` yourselves. Do not take the expected values on faith — recompute at least Groups A, B and C with a calculator.
- [ ] Open the app on a **real phone**, not just a desktop browser. Check no sideways scrolling and that the time picker works.
- [ ] Confirm no external network requests: `F12` → **Network** → reload → the list should contain only the local files.
- [ ] Confirm nothing is stored: `F12` → **Application** → Local Storage / Session Storage / Cookies should all be empty after using the app.
- [ ] Read every user-facing sentence and rewrite anything that does not sound like your team.

---

## 3. Things AI got wrong or could plausibly get wrong

Worth recording honestly — an assessor asking "did you just accept whatever it produced?" needs a real answer.

- **Placeholder numbers can look authoritative.** The AI wrote "6 minutes" in a clean table. Nothing about the presentation signals that it is a guess. This is exactly why `DATA_NOTES.md` marks every unmeasured value with ⚠️.
- **Boundary conditions are a classic AI slip.** `>` versus `>=`, and `<` versus `<=` on the "not in the future" check, are easy to get subtly wrong and produce answers that look plausible. Cases A3, B3, C1, D3 and E6 exist specifically to catch that class of bug.
- **Generated documentation can overstate what exists.** Any claim in a generated README should be checked against the running app before submission.
- **It will confidently write code for things the brief excluded.** The team must keep the scope boundary, not the tool.

---

## 4. Suggested declaration wording

> Parts of this prototype's code and documentation were drafted with the assistance of an AI coding assistant (Claude). The problem definition, user scope, decision rules, threshold values, privacy decisions and test expectations were determined by the team and given to the tool as a written specification. All generated code and documentation were reviewed, tested and edited by the team, and every team member can explain the components they own. All timing and queue values are unverified placeholders created by the team, clearly labelled as demo estimates in the application and documented in `DATA_NOTES.md`. No third-party code, libraries, fonts, images or datasets are used.

Adjust this once the team has actually done the reviewing described in section 2 — do not submit it beforehand.

---

## 5. Other external material

| Type | Used? | Notes |
|---|---|---|
| Third-party JS libraries | **No** | Plain HTML/CSS/JS, zero dependencies |
| Web fonts | **No** | System font stack only |
| Icons / images | **No** | Unicode characters only (✓ ! ✕ ?) |
| NP logo or branding | **No** | Deliberately excluded |
| Datasets | **No** | All values are team-written placeholders |
| Stall names | Real | Actual Food Club stall names, used descriptively |

---

## 6. Individual ownership record

Fill this in before submission. Every member must be able to answer for their rows.

| Team member | Owns | Can explain without notes | Verified by hand |
|---|---|---|---|
| | `feasibility.js` + `TEST_CASES.md` | ☐ | ☐ |
| | `data.js` + `DATA_NOTES.md` | ☐ | ☐ |
| | `index.html` + `styles.css` (UI and wording) | ☐ | ☐ |
| | `app.js` + demo script in `README.md` | ☐ | ☐ |
| | Privacy / LegalTech decisions and this file | ☐ | ☐ |
