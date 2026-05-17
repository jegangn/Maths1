# Math Tutor App — Design Spec

**Date:** 2026-05-18
**Audience:** one 5-year-old child (level: fluent within 10), parent-directed
**Inspiration:** Synthesis Tutor (https://www.synthesis.com/tutor) — pedagogy and UI patterns, not assets
**Status:** approved through Section 5; ready for implementation plan

---

## 1. Goals and non-goals

### Goals

- Teach **addition (within 10 → 20 → 100)**, **subtraction (within 10 → 20)**, and **multiplication (equal groups → arrays → skip counting)** to one 5-year-old who is already fluent with addition within 10.
- Match Synthesis Tutor's calm, conceptual, mastery-gated feel on a Galaxy Tab S8+ in landscape.
- Use the Concrete → Pictorial → Abstract (CPA) progression evidence-based for early years maths (Singapore Math, Math Recovery research).
- Run offline on the tablet after first load; installable as a PWA so it gets a home-screen icon and no browser chrome.

### Non-goals

- ❌ No accounts, no cloud sync, no analytics, no telemetry.
- ❌ No leaderboards, no XP, no badges shelf, no streaks.
- ❌ No multi-profile, no multiplayer, no ads.
- ❌ No voice/TTS — sound effects only.
- ❌ No reading instruction or other subjects.
- ❌ No native iOS/Android app — PWA only.

---

## 2. Scope and curriculum

### Starting point

The child is fluent on addition within 10. Lesson 1 begins with light review (Add ≤ 10), then moves into new material.

### Curriculum tree

| Track          | Sub-skill                         | Lessons | Manipulative            |
| -------------- | --------------------------------- | ------- | ----------------------- |
| Addition       | Add within 5 (review)             | 3       | Tens-frame              |
| Addition       | Add within 10 (number bonds)      | 5       | Tens-frame, Number bond |
| Addition       | Add within 20 (make-ten strategy) | 6       | Double tens-frame       |
| Addition       | Add within 100 (tens + ones)      | 5       | Place-value blocks      |
| Subtraction    | Subtract within 5 (take-away)     | 3       | Tens-frame              |
| Subtraction    | Subtract within 10 (count-back)   | 5       | Tens-frame, Number line |
| Subtraction    | Missing-addend (\_\_ + 3 = 7)     | 4       | Number bond             |
| Subtraction    | Subtract within 20 (cross-ten)    | 5       | Double tens-frame       |
| Multiplication | Equal groups                      | 4       | Equal groups            |
| Multiplication | Arrays                            | 4       | Array grid              |
| Multiplication | Skip counting (2s, 5s, 10s)       | 5       | Number line             |
| Multiplication | Times tables (×2, ×5, ×10)        | 6       | Array grid              |

**Total: 55 lessons in V1, 12 sub-skills, 3 tracks.**

### Lesson structure

Every lesson is **3 intro + 5 practice + 3 quiz = 11 problems**, ~5–8 min for a fluent kid.

- **Intro (concrete):** problem fully animated; the manipulative auto-demonstrates the solution; kid taps to confirm.
- **Practice (pictorial):** manipulative is visible; kid manipulates it; visual hints available after 1 wrong answer.
- **Quiz (abstract):** problem shown symbolically; manipulative collapses to a thin reference; kid types the answer.

### Mastery gate

A lesson is "passed" when the child gets:

- ≥ 4/5 practice problems correct on first try, **and**
- ≥ 2/3 quiz problems correct on first try.

If failed, the lesson repeats with freshly generated problems. An **attempt** = one full run through a lesson (intro + practice + quiz). After 3 failed attempts on the same lesson, the engine silently routes back to the prerequisite lesson for a refresh, then returns to the failed lesson. The child never sees a "you failed" screen.

### Star rating

- 3 stars: all 8 practice + quiz correct on first try
- 2 stars: passed but with some wrong-then-corrected attempts
- 1 star: passed after 2+ attempts on a single problem

---

## 3. Architecture

### Tech stack

| Layer       | Choice                                     | Reason                                     |
| ----------- | ------------------------------------------ | ------------------------------------------ |
| Framework   | Next.js 15, App Router, static export      | Simple, fast, PWA-ready                    |
| Language    | TypeScript (strict)                        | Catch bugs in lesson logic                 |
| Styling     | Tailwind CSS                               | Fast iteration, consistent spacing         |
| Animations  | Framer Motion                              | Smooth, physics-based manipulative motion  |
| State       | Zustand                                    | Tiny, no boilerplate                       |
| Persistence | `localStorage` (single key `mathTutor.v1`) | Offline, no backend                        |
| Sound       | Howler.js                                  | Reliable on Android Chrome, sprite support |
| PWA         | next-pwa or hand-rolled service worker     | Installable, offline                       |
| Build       | bun                                        | Per project rule (never npm)               |

### Folder layout

```
math-tutor-app/
├── app/                              Next.js pages
│   ├── page.tsx                      Home / lesson map
│   ├── lesson/[id]/page.tsx          Lesson player
│   ├── done/page.tsx                 Celebration screen
│   └── parent/page.tsx               Hidden parent view
├── components/
│   ├── manipulatives/                TensFrame, DoubleTensFrame, PlaceValueBlocks,
│   │                                 EqualGroups, ArrayGrid, NumberLine, NumberBond
│   ├── mascot/                       Riko component + emotion state machine
│   ├── feedback/                     CorrectBurst, GentleNudge, StuckHint
│   ├── input/                        NumberPad, AnswerTiles
│   └── layout/                       LessonShell, ProgressBar, LessonMap
├── lessons/                          JSON lesson definitions (one file each)
├── engine/
│   ├── problemGenerator.ts           Generates problems from templates
│   ├── masteryTracker.ts             Tracks per-skill accuracy
│   ├── lessonRouter.ts               Picks next lesson, handles re-routing
│   └── storage.ts                    localStorage read/write + migrations
├── lib/
│   ├── sound.ts                      Sound effect player (Howler wrapper)
│   └── types.ts                      Shared TS types
└── public/
    ├── mascot/                       SVG sprites for Riko's 6 states
    ├── sounds/                       correct.mp3, wrong.mp3, win.mp3, drop.mp3
    └── manifest.json                 PWA manifest
```

### Data flow

```
lessons/*.json  →  problemGenerator  →  Lesson player  →  user taps  →
                                                            ↓
                                       masteryTracker  ←  result
                                            ↓
                                    storage.write  →  localStorage
                                            ↓
                                       lessonRouter  →  next lesson
```

---

## 4. UI design

### 4.1 Home / Lesson map

Horizontally-scrolling path of stones. Each stone = one lesson.

- **Locked:** muted grey, no glow.
- **Unlocked, not started:** soft glow in track colour (warm yellow for addition, soft blue for subtraction, coral for multiplication).
- **Completed:** small star in centre (1, 2, or 3 stars).
- **Mascot stands on the next stone he should tap.** That is the only "play here" affordance.
- No XP, no streak, no badges.

### 4.2 Lesson player

Landscape only. Three zones:

```
┌──────────────┬─────────────────────────────────┬──────────────┐
│              │                                 │              │
│   Mascot     │      Manipulative work area     │   Answer     │
│  + problem   │   (tens-frame / array / etc.)   │   pad or     │
│   prompt     │                                 │   tiles      │
│              │                                 │              │
└──────────────┴─────────────────────────────────┴──────────────┘
       ↑                                              ↑
  progress dots                              "next" button
  across bottom                              (only after correct)
```

- Left zone (~22% width): Riko (180px tall, bottom-aligned) + speech bubble with prompt text.
- Centre zone (~56% width): manipulative, chosen by lesson JSON.
- Right zone (~22% width): for tap problems, 3 large answer tiles (1 correct, 2 plausible distractors); for type problems, a 0–9 number pad with confirm.

### 4.3 Feedback states

| State                  | Visual                                                                     | Audio             | Duration |
| ---------------------- | -------------------------------------------------------------------------- | ----------------- | -------- |
| Correct                | Green pulse on tile + mascot small bounce + star fills in progress         | Soft bright chime | 600ms    |
| Wrong                  | Tile single 15° wobble + mascot tilts head + manipulative hint highlight   | Gentle low thunk  | 400ms    |
| Stuck (after 2 wrongs) | Manipulative animates solution one step at a time, then retry same problem | —                 | 2.5s     |
| Lesson complete        | Mascot walks to next stone, 1–3 stars fade in                              | Single chord      | 2s       |

No fireworks. No XP popups. No "skip" button.

### 4.4 Hidden parent view

Reachable by tapping the version number in the footer 5 times. Shows:

- Lessons completed this week
- Current track + lesson
- Skills that needed >1 attempt (worth practising offline)
- "Export progress" button → downloads the localStorage JSON
- "Reset progress" button → clears localStorage after confirm

No PIN, no auth.

---

## 5. Manipulatives

Each manipulative is one screen, one job. The engine chooses for the kid — he never picks a tool.

### 5.1 Tens-frame

2×5 grid of rounded squares. Dots live in a tray below. Drag dots into the frame, left-to-right, top-row first (Singapore order). Subtraction: pre-filled dots, drag down to "take away" tray.

**Used in:** Add ≤10, Sub ≤10, Add ≤5 review, Sub ≤5.

### 5.2 Double tens-frame

Two tens-frames side by side. For `a + b` crossing 10, dots spill from left frame into right frame, visualising make-ten.

**Used in:** Add ≤20, Sub ≤20.

### 5.3 Place-value blocks

Vertical tens-rods (10 dots stacked) + single ones-cubes. Long-press workspace to "combine" — 10 ones auto-bundle into a new rod, showing regrouping.

**Used in:** Add ≤100.

### 5.4 Equal groups

N plates in a row, each with M cookies. Tap a plate to count; "skip count" toggle highlights groups and ticks total by M.

**Used in:** Mul: equal groups, skip counting.

### 5.5 Array grid

`rows × columns` of dots. Single tap rotates 90° — same dots, rows ↔ columns. Introduces commutativity visually.

**Used in:** Mul: arrays, times tables.

### 5.6 Number line

Horizontal line, 0 to 20, evenly spaced. A small frog hops along it — one hop per count, can hop by 2s/5s/10s for skip counting.

**Used in:** Add ≤10 (count-on), Sub ≤10 (count-back), skip counting.

### 5.7 Number bond

Three connected circles (whole on top, two parts below). Drag numbers or dots in; the third auto-fills only when correct. Reinforces inverse of addition and subtraction.

**Used in:** Add ≤10 number bonds, missing-addend subtraction.

---

## 6. Mascot — Riko

A small fox, calm and patient. Carries the app's emotional weight since there is no voice.

### Visual

- Flat SVG, two-tone: warm orange body `#E8923C`, cream belly `#FAF1E1`, 2.5px black outline.
- Round shapes, big eyes (shiny dots, no pupils), triangle ears, single fluffy tail.
- 180px tall on tablet. Fixed bottom-left of prompt panel during lessons.
- No gradients, no shading, no shimmer. Calm and modern.

### Personality

Calm. Patient. Curious. Closer to Mr. Rogers than Duolingo's owl. Never sad, never disappointed, never frantic.

### Animation states (6 total — the entire vocabulary)

| State       | Trigger                       | Visual                                                   |
| ----------- | ----------------------------- | -------------------------------------------------------- |
| Idle        | Default while kid is thinking | Slow blink every ~4s, gentle tail sway                   |
| Watching    | Kid is dragging               | Eye dots shift up to ±6px tracking the dot               |
| Thinking    | Kid idle >12s on a problem    | Eyebrows lift, slight head tilt, paw on chin, "?" bubble |
| Happy       | Correct answer                | Eye crescents, mouth up, single 40px bounce              |
| Encouraging | Wrong answer                  | Wide eyes, head tilt right, paw raised                   |
| Celebrating | Lesson complete with 3 stars  | Both paws raised, eyes closed in joy, tail wags 1.5s     |

### Where he appears

- Lesson map (on next stone)
- Lesson player (bottom-left)
- Lesson complete (centre)

Nowhere else. Not on settings, not on parent view, not in app chrome.

---

## 7. Data model

### 7.1 Lesson JSON schema

```json
{
  "id": "add-20-make-ten-01",
  "track": "addition",
  "title": "Make a ten",
  "skill": "add-within-20-make-ten",
  "manipulative": "double-tens-frame",
  "intro": [
    { "a": 9, "b": 4, "showHint": "fill-to-ten" },
    { "a": 8, "b": 5, "showHint": "fill-to-ten" },
    { "a": 7, "b": 6, "showHint": "fill-to-ten" }
  ],
  "practiceTemplate": {
    "type": "make-ten",
    "aRange": [6, 9],
    "bRange": [3, 7],
    "constraint": "sum > 10",
    "count": 5
  },
  "quizTemplate": {
    "type": "make-ten",
    "aRange": [6, 9],
    "bRange": [3, 7],
    "constraint": "sum > 10",
    "count": 3,
    "showHint": false
  },
  "prerequisites": ["add-within-10-bonds-05"],
  "unlocks": ["add-20-make-ten-02"]
}
```

### 7.2 Progress storage (localStorage key `mathTutor.v1`)

```json
{
  "version": 1,
  "profile": { "name": "Aarav", "createdAt": "2026-05-18" },
  "currentLessonId": "add-20-make-ten-02",
  "lessons": {
    "add-10-bonds-01": {
      "stars": 3,
      "firstTryAccuracy": 1.0,
      "attempts": 1,
      "completedAt": "2026-05-18T10:32:00Z"
    }
  },
  "skillMastery": {
    "add-within-10-bonds": {
      "successes": 8,
      "attempts": 10,
      "lastSeen": "2026-05-18T10:45:00Z"
    }
  },
  "sessionHistory": [
    { "date": "2026-05-18", "minutesSpent": 12, "lessonsCompleted": 2 }
  ]
}
```

Schema is versioned for future migrations.

---

## 8. Edge cases

| Case                              | Behaviour                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Storage missing / wiped           | First launch shows "_progress was lost — start over?_" sheet for parent; if confirmed, fresh start |
| Rapid double-tap during animation | Manipulative input disabled during Framer Motion frames; no double-fire                            |
| Dot dragged outside frame         | Spring back to tray; never disappears                                                              |
| App closed mid-lesson             | Current problem state saved per-tap; resumes on same problem                                       |
| Tablet rotates to portrait        | PWA manifest locks landscape; defensive "turn sideways" overlay if it slips through                |
| Stuck on same lesson 3 attempts   | Engine silently routes to prerequisite, then back; no "you failed" screen                          |
| Tablet muted                      | Animations and visual pulses still convey feedback; sound is additive                              |
| No service worker support         | Falls back to browser cache; still works online                                                    |

---

## 9. Build, deploy, install

1. `bun create next-app math-tutor-app --typescript --tailwind --app`
2. Develop with `bun run dev`
3. Build static export with `bun run build`
4. Copy the `out/` folder onto a USB stick or host on Vercel free tier
5. On the Galaxy Tab S8+: open the URL in Chrome → menu → "Add to Home screen"
6. App icon appears; tap launches full-screen PWA with offline support

---

## 10. Open questions for the implementation phase

These are not blockers — flagging them so the implementation plan addresses them explicitly:

1. **Mascot SVG sourcing.** Either I hand-author the 6 SVG states, or we use an AI image tool to draft them and I clean up the SVG. Decide in the plan.
2. **Sound effect sourcing.** Royalty-free packs (Pixabay, freesound.org) vs. hand-generated tones. Decide in the plan.
3. **Distractor generation.** For tap-the-answer problems, the 2 wrong tiles need to be plausible (e.g. for 8+5, distractors might be 12 and 14, not 99). Algorithm specified in the implementation plan.
4. **Problem-generator seeding.** Use a deterministic seed per lesson per attempt so a child can resume the same problem after closing the app.

These get resolved during the writing-plans phase.
