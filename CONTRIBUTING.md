# Contributing

Thanks for your interest in contributing a skill. This guide covers everything you need.

## Adding a Skill

### 1. Create the skill directory

```bash
mkdir -p skills/your-skill-name/.claude-plugin
```

### 2. Create the skill file

Create `skills/your-skill-name/SKILL.md`:

```markdown
---
name: your-skill-name
description: >
  When this skill should activate. Be specific about trigger conditions.
---

# Your Skill Name

## When to Use

Describe when an agent should activate this skill.

## When Not to Use

Describe when this skill is not appropriate.

## Instructions

Step-by-step instructions the agent follows.

## Key Principles

- Guiding principles for this skill
```

### 3. Create the plugin metadata

Create `skills/your-skill-name/.claude-plugin/plugin.json`:

```json
{
  "name": "your-skill-name",
  "description": "Short description of what the skill does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT"
}
```

### 4. Register in the marketplace

Add an entry to `.claude-plugin/marketplace.json` in the `plugins` array:

```json
{
  "name": "your-skill-name",
  "description": "Short description of what the skill does",
  "author": {
    "name": "Your Name"
  },
  "source": "./skills/your-skill-name",
  "category": "development"
}
```

## SKILL.md Format

### Frontmatter

The YAML frontmatter requires two fields:

- **`name`** — Unique identifier. Lowercase, hyphens, descriptive.
- **`description`** — When the skill should activate. This is what agents use to decide whether to invoke the skill.

These two fields are supported across all 40+ agents in the skills ecosystem. Agent-specific fields like `allowed-tools` or `context: fork` can be added when needed.

### Content

Structure the markdown body with these sections:

- **When to Use** — Specific trigger conditions
- **When Not to Use** — Exclusion criteria
- **Instructions** — What the agent should do
- **Key Principles** — Guiding rules (optional)

## Naming Conventions

- Lowercase with hyphens: `my-skill-name`
- Descriptive: the name should hint at what the skill does
- No generic names: `helper`, `utils`, `tools` are too vague

## Quality Guidelines

- **One skill, one purpose.** If a skill covers multiple concerns, split it.
- **Agent-agnostic language.** Avoid tool names specific to one agent (e.g., don't say "use the Read tool" — say "read the file").
- **Include both triggers and exclusions.** "When to Use" and "When Not to Use" prevent false activations.
- **Be specific.** Vague instructions produce vague results.

## Submitting

1. Fork this repository
2. Create a branch: `git checkout -b add-your-skill-name`
3. Add your skill following the steps above
4. Submit a pull request with a short description of what the skill does and when it's useful
