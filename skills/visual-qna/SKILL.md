---
name: visual-qna
description: Use when you need the user to answer a batch of structured multiple-choice questions in a browser form — brainstorm decisions, picking from options, questionnaires, A/B/C choices with notes and an "Other". Requires the Playwright MCP. Not for mockups, diagrams, or visual design comparisons.
---

# Visual Q&A

## Overview

Render a set of structured questions as an interactive form in a Playwright-driven browser, let the user click their answers (single- or multi-select, with an "Other" choice and a free-text note per question), then read the answers back as structured data. Good for batches of decisions where the native one-question-at-a-time terminal flow is slow.

Core idea: **inject a reusable form engine into `about:blank` via the Playwright MCP — no server, no files, no ports.**

## When to use

- A batch (≈3+) of multiple-choice questions: brainstorm decisions, option-picking, questionnaires, A/B/C choices.
- You want per-question notes and an "Other" escape hatch alongside fixed options.
- You want the answers handed back as structured data to act on.

## When NOT to use

- **Mockups, wireframes, diagrams, visual design comparisons** → that is a *visual companion's* job, not this. This skill is for answering questions, not looking at pictures.
- One or two simple questions → just ask in the terminal, or use the native `AskUserQuestion` tool.
- Playwright MCP is unavailable → see Requirements.

## Requirements (hard dependency)

This skill **requires the Playwright MCP** browser tools (`browser_navigate`, `browser_evaluate`, `browser_take_screenshot`). If they are not available, **stop and tell the user to enable the Playwright MCP plugin** — do not attempt a workaround. (`file://` URLs are blocked by Playwright and a local HTTP server is often blocked by the sandbox, so there is no clean fallback; this skill is Playwright-only by design.)

## The loop

1. **Confirm Playwright MCP is available.** If not, error out (see Requirements).
2. `browser_navigate` to `about:blank`.
3. `Read` the sibling file `qa-form.js` and pass its **entire contents** as the `function` argument to `browser_evaluate`. (It is already a `() => {}` arrow function; running it defines `window.__qaInit`, `__qaToggle`, `__qaNote`, `__qaResults` on the page.)
4. `browser_evaluate` with `() => window.__qaInit(CONFIG)` where `CONFIG` is your question set (see Schema). This renders the form.
5. `browser_take_screenshot` so the user sees the form.
6. Post the questions as a short text list in chat for reference, then tell the user: **"Click your answers in the browser, then reply when done."** End your turn.
7. On your next turn, `browser_evaluate` with `() => window.__qaResults()` and parse the returned JSON. Merge with any terminal text the user added. Hand the structured results to whatever asked for them.

To re-ask or revise: call `window.__qaInit(newConfig)` again (it resets state), or just read results again if the user kept editing.

## Config schema

```js
{
  title: "Sub-project 6 — Dashboard Composition",
  questions: [
    {
      id: "q1",                       // stable, simple slug (no quotes/spaces)
      title: "Layout model",
      detail: "Optional one-line context.",
      options: [
        { letter: "A", text: "...", recommended: true },
        { letter: "B", text: "..." }
      ],
      multi: false,                   // true = allow multiple selections
      allowOther: true                // default true; appends a dashed "O — Other"
    }
  ]
}
```

## Results shape

`window.__qaResults()` returns JSON:

```js
{
  selections: { q1: "B", q2: ["A", "C"], q3: "O" },  // string (single) or array (multi)
  notes:      { q3: "free text the user typed" }
}
```

- A question is "answered" when its selection is truthy (non-empty array for multi).
- `"O"` means the user chose **Other** — read `notes[id]` for the substance.

## Non-interference with a visual companion

This skill is deliberately separate from any brainstorming "visual companion":

- It uses **only** the Playwright MCP browser. It never starts an HTTP server, opens ports, or writes to `.superpowers/` (or any other companion's session dirs).
- **Do not run it in the same turn as an active visual-companion session** — they would compete for the user's attention in different browsers.
- Division of labour: **visual companion = "look at this mockup/diagram"; visual-qna = "answer these questions."**

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Hand-writing the engine inline | Always `Read` and inject `qa-form.js` verbatim — don't reinvent it. |
| Trying a `file://` URL or a local server | Blocked (Playwright / sandbox). Use `about:blank` + injection only. |
| Reading results before the user replies | Render, end your turn, read `__qaResults()` only after the user says done. |
| Using it for mockups/diagrams | Wrong tool — that's a visual companion. |
| `id`s with spaces/quotes | Use simple slugs; they're embedded in inline onclick handlers. |
| Assuming an answer when `selections[id]` is absent | Absent = unanswered; ask or treat as undecided, don't infer. |
