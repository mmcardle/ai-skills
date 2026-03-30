# ai-skills Repository Design

## Overview

A community-driven, agent-agnostic AI skill repository at `mmcardle/ai-skills`. Skills are installable via two channels:

- **Any agent:** `npx skills add mmcardle/ai-skills`
- **Claude Code:** `claude plugin marketplace add mmcardle/ai-skills`

The repo ships as a skeleton with one example skill. Real skills will be added over time.

## Repository Structure

```
ai-skills/
├── .claude-plugin/
│   └── marketplace.json       # Claude Code marketplace manifest
├── skills/
│   └── example-skill/
│       ├── .claude-plugin/
│       │   └── plugin.json    # Claude plugin metadata
│       └── SKILL.md           # Skill content
├── .gitignore
├── CONTRIBUTING.md            # How to add skills, format guide, PR process
├── LICENSE                    # MIT
└── README.md                  # Overview, install instructions for both channels
```

### Key decisions

- `skills/` is the single source of truth for all skills.
- Each skill is a directory containing a `SKILL.md` with YAML frontmatter.
- Each skill directory also contains `.claude-plugin/plugin.json` for Claude Code plugin validation.
- `marketplace.json` references each skill directory directly as a standalone Claude plugin (`"source": "./skills/<name>"`).
- No `plugins/` wrapper layer. Flat and simple.
- Adding a new skill = create `skills/<name>/SKILL.md` + create `skills/<name>/.claude-plugin/plugin.json` + add one entry to `marketplace.json`.

## Marketplace Manifest

`.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "mmcardle-ai-skills",
  "description": "A community-driven collection of AI coding agent skills",
  "owner": {
    "name": "Mark McArdle",
    "url": "https://github.com/mmcardle"
  },
  "plugins": [
    {
      "name": "example-skill",
      "description": "An example skill demonstrating the ai-skills format",
      "author": {
        "name": "Mark McArdle"
      },
      "source": "./skills/example-skill",
      "category": "development"
    }
  ]
}
```

- Marketplace name: `mmcardle-ai-skills`
- Install individual skills via: `claude plugin install example-skill@mmcardle-ai-skills`
- Each skill directory is a `source` entry pointing to `./skills/<name>`

## Skill Directory Format

Each skill directory:

```
skills/<skill-name>/
├── .claude-plugin/
│   └── plugin.json
└── SKILL.md
```

### plugin.json

```json
{
  "name": "<skill-name>",
  "description": "Short description",
  "version": "1.0.0",
  "author": {
    "name": "Author Name"
  },
  "license": "MIT"
}
```

### SKILL.md

```markdown
---
name: <skill-name>
description: >
  Trigger conditions — when should an agent activate this skill.
---

# Skill Name

## When to Use

Describe activation triggers.

## Instructions

Step-by-step instructions the agent follows.

## Key Principles

- Guiding principles for this skill
```

Frontmatter uses only `name` and `description` — the two fields universally supported across all 40+ agents in the `npx skills` ecosystem. Agent-specific fields like `allowed-tools` or `context: fork` may be added per-skill when needed but are not part of the default template.

## Example Skill

The `example-skill` serves as a template. Its content is deliberately simple — it demonstrates the format rather than providing a real workflow. Contributors copy this directory as a starting point.

## README.md

Contents:
- One-line description of the repo
- Two install methods side by side (`npx skills add` and `claude plugin marketplace add`)
- Table of available skills (just example-skill initially)
- Link to CONTRIBUTING.md

## CONTRIBUTING.md

Contents:
- How to add a skill (3 steps: create dir with SKILL.md + plugin.json, add to marketplace.json)
- SKILL.md format reference (frontmatter fields, content structure)
- Naming conventions: lowercase, hyphens, descriptive
- Quality guidelines:
  - One skill = one purpose
  - Agent-agnostic language (no tool names specific to one agent)
  - Include "when to use" and "when not to use" sections
  - Keep skills focused; split if multiple concerns emerge
- PR process: fork, branch, PR with description of what the skill does

## Setmeup Integration

After the repo is published, add to `home/dot_config/setmeup/agent-skills.list` in `mmcardle/setmeup`:

```
mmcardle/ai-skills claude-code
mmcardle/ai-skills codex
```

No changes to the install script are needed — it already reads from the list and runs `npx skills add` for each entry.

## License

MIT — matches the broader skills ecosystem (gianchub, Vercel Labs, Anthropic official).

## Files to Create

1. `.claude-plugin/marketplace.json` — marketplace manifest
2. `skills/example-skill/.claude-plugin/plugin.json` — example plugin metadata
3. `skills/example-skill/SKILL.md` — example skill content
4. `.gitignore` — standard Node/OS ignores
5. `CONTRIBUTING.md` — contribution guide
6. `LICENSE` — MIT license
7. `README.md` — project overview and install instructions
