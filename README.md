# BiteBack

**One student. One question. One answer.**

> *"My break is short. If I buy Chicken Rice at Food Club, will I still get to my Block 37 lesson on time?"*

BiteBack is a mobile-first proof-of-concept for the LEAD LaunchPad assignment. It estimates whether a single NP student, starting at **Block 7**, can walk to **Food Club**, queue for **Chicken Rice**, eat properly, and reach **Block 37** before their next lesson starts.

It answers with one of four clearly labelled states: **Feasible**, **Risky**, **Not feasible**, **Unknown**.

---

## What this prototype is NOT

Being explicit about scope is part of the proof-of-concept. BiteBack deliberately has **no**:

| Not included | Why |
|---|---|
| Accounts, login, name, student ID, email | Not needed to answer the question — so we do not collect it (PDPA data-minimisation) |
| Payment, ordering, reviews, nutrition | This is a *timing decision* tool, not a food app |
| GPS or live location | Route is fixed; location data is sensitive and unnecessary |
| Timetable import | Adds a file-upload attack surface for one number the user can type |
| Backend, database, server, saved history | Nothing to breach if nothing is stored |
| Analytics or trackers | No behavioural data collection |
| `localStorage` / `sessionStorage` / cookies | Session state lives in memory and disappears when the tab closes |
| A real camera or working computer vision | Queue counts are **simulated placeholders**, and the UI says so on every screen |

---

## How to run it

**Option 1 — just open it (simplest, works offline)**

Double-click `index.html`. There is no build step, no `npm install`, no dependencies. Plain HTML, CSS and JavaScript.

**Option 2 — local web server (closest to how it will be hosted)**

```bash
cd biteback
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

**Option 3 — GitHub Pages**

Push this folder to a repository, then in **Settings → Pages** choose the branch and folder containing `index.html`. The site is entirely static, so it works as-is.

**To view it as a phone (do this before the demo):**
Press `F12` → click the device-toolbar icon (`Ctrl+Shift+M`) → choose *iPhone SE* or *Pixel 7*. The layout is mobile-first and must not scroll sideways.

---

## File map

| File | What it holds | Who should be able to explain it |
|---|---|---|
| `index.html` | The three screens and all on-screen wording | Whoever owns UI/content |
| `styles.css` | Mobile-first layout, status colours + icons | Whoever owns design |
| `data.js` | **Every placeholder number, in one place** | Whoever owns Analytics / data collection |
| `feasibility.js` | The decision rule as one pure function | Whoever owns Software Engineering / TDD |
| `app.js` | Screen wiring only — no numbers, no rules | Whoever owns integration |
| `TEST_CASES.md` | TDD RED test cases for the feasibility rule | Software Engineering owner |
| `DATA_NOTES.md` | Every placeholder + how to replace it with real data | Analytics owner |
| `GENAI_DECLARATION_NOTES.md` | What AI generated, what the team must verify | Everyone |

**The one thing to remember:** numbers live in `data.js`, rules live in `feasibility.js`, screens live in `app.js`. Nothing is duplicated across those three.

---

## The calculation, in plain words

```
Available minutes      = next lesson time − current time
Base non-eating time   = walk to Food Club (6)
                       + Chicken Rice queue (9)
                       + preparation (4)
                       + walk to Block 37 (6)
                       = 25 minutes
Eating time before buffer = Available − 25
Eating time after buffer  = Available − 25 − 10 (safety buffer)
```

| Result | Condition |
|---|---|
| **Feasible** ✓ | Eating time *after* buffer is **≥ 15 min** |
| **Risky** ! | Eating time before buffer ≥ 15 min, but after buffer **< 15 min** |
| **Not feasible** ✕ | Eating time *before* buffer is **< 15 min** |
| **Unknown** ? | Required timing data is missing, stale, unsupported or invalid |
| **Input rejected** | Lesson time is missing or is not later than the current time |

All numbers above are **demo placeholders**. See `DATA_NOTES.md`.

---

## Two clock modes

| Mode | Uses | When to use it |
|---|---|---|
| **Demo mode** *(default)* | Fixed current time of **1:00 PM**, editable | The viva — results are identical every run |
| **Device time** | The real clock on the phone/laptop | Showing that it works in real life |

Default demo lesson time is **1:50 PM**, which gives `50 − 25 − 10 = 15` minutes of eating time → **Feasible**.

---

## Demo script (5–7 minutes)

Aligned to the LaunchPad rubric. Roughly one minute per beat.

**0:00 — The problem (one user, one task, one outcome)**
> "Our user is a Year 1 student at Block 7 with a short break. Their next lesson is at Block 37. The question is not *what should I eat* — it is *do I even have time to eat*. Right now students guess, and guessing wrong means walking in late."

**1:00 — The input screen**
Show that only **one** field is actually editable: the lesson time. Point at the locked route fields.
> "Everything else is fixed because this is a proof-of-concept for one route. We are not pretending to support the whole campus."
Point at the privacy line at the bottom.
> "No name, no student ID, no login, no location. That is a LegalTech decision, not a missing feature — we return to it later."

**2:00 — The queue screen (Analytics + honesty)**
Scroll the 13 Food Club stall cards.
> "These are **simulated computer-vision queue snapshots**. No camera is connected. The banner says so, and every card shows how old its snapshot is. Two stalls are deliberately broken — Waffles and Dessert has no wait estimate, Drinks and Fresh Fruit has a stale one — so you can see how we handle bad data."
> "Only Chicken Rice has the full calculation. The other twelve honestly say 'queue comparison only'."

**3:00 — The result (the core value)**
Tap Chicken Rice → **Feasible**.
> "Fifty minutes available. Twenty-five go to walking, queueing and waiting. Ten more are a safety buffer. Fifteen minutes left to eat, which is our minimum. Notice the status is a word plus an icon plus a colour — not colour alone, because roughly one in twelve men has some colour-vision deficiency."
Show the breakdown table.
> "The student can see exactly where every minute went. If they disagree with a number, they can point at it."

**4:00 — The edge states (Software Engineering + Defence)**
Go back, change the lesson time to **1:39 PM** → **Not feasible**. Then **1:49 PM** → **Risky**.
> "Three different answers from the same rule. Now the interesting one —"
Open **Demo controls** → tick *Simulate missing Chicken Rice queue data* → **Unknown**.
> "When the data is missing or older than ten minutes, BiteBack refuses to guess. A confident wrong answer makes a student late; 'Unknown' does not. That is a deliberate design decision, and every one of these cases is written down in `TEST_CASES.md`."
Try submitting a past lesson time → the input is rejected with an explanation.

**5:00 — LEAD decisions in one breath**
> "**Analytics** — the placeholder timings are all in one file with a plan for replacing them with stopwatch observations. **Software Engineering** — the rule is one pure function separate from the UI, with a RED test set written before we trusted it. **Defence** — no stored data, no backend, no third-party scripts, and stale data fails safe to Unknown. **LegalTech** — PDPA data minimisation: we collect nothing personal, and we never imply the estimates are guarantees."

**6:00 — Honest limitations**
> "Every timing number is a placeholder we have not yet measured. There is no real computer vision. It models one stall on one route. We know all three, they are documented, and the app tells the user rather than hiding it."

---

## Known limitations (say these before the assessor does)

1. **No real observation data yet.** All timings are estimates the team wrote, not measured. `DATA_NOTES.md` lists exactly what must be measured.
2. **No real computer vision.** Queue counts are hand-written demo values.
3. **One stall, one route.** Chicken Rice from Block 7 to Block 37 only.
4. **Averages, not individuals.** Walking speed varies; the model assumes one pace.
5. **No same-day recalculation.** The queue snapshot does not update while you walk.

---

## Sources for external material

- No third-party code, libraries, fonts, images or icons are used. Icons are Unicode characters and the layout is hand-written CSS.
- AI assistance in producing this prototype is declared in `GENAI_DECLARATION_NOTES.md`.
