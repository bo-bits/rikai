# Rikai — AI Personalized Learning Companion

An AI tutor that gets better at teaching you specifically over time. Claude provides the knowledge. Rikai provides the context layer — a per-student vault of what you've explored, what's clicked, what hasn't, and what you keep circling back to.

---

## Structure

```
rikai/
├── system/                        # How the teacher behaves
│   ├── teacher_persona.md         # Tone, Socratic rules, defaults
│   ├── prompts/
│   │   ├── onboarding.md          # First-session interview prompt
│   │   └── session_start.md       # Session prompt template (all modes)
│   └── skills/
│       ├── session.md             # /session skill — how to run a session
│       └── signal_extraction.md   # /signal-extraction skill — post-session vault update
│
└── students/                      # Per-student vault (the personalization layer)
    └── template/                  # Copy this for each new student
        ├── profile.md             # Who they are, how they learn, interests
        ├── signals.md             # Extracted interest signals, most recent first
        ├── topics/
        │   ├── index.md           # One-line summary per topic explored
        │   ├── _template.md       # Copy for each new topic
        │   └── {topic-slug}.md    # Per-topic knowledge state + wikilinks
        └── sessions/
            ├── _template.md       # Session log template
            └── {date}-{slug}.md   # One file per session
```

---

## Three modes

| Mode | When | Opens with |
|------|------|-----------|
| **Explore** | New topic | "What do you already know about X, if anything?" |
| **Deepen** | Returning to a known topic | The open thread from the last session on that topic |
| **Recall** | Checking retention inline or on demand | A specific question derived from what they know |

---

## How a session works (V0 — Claude Code)

### First session (new student)
1. Create `students/{id}/` from the template
2. Run `/session --student={id} --mode=onboard` — loads `system/prompts/onboarding.md`
3. After onboarding, run `/signal-extraction --mode=onboarding` — seeds `profile.md`, `topics/index.md`, `signals.md`

### Ongoing session
1. Run `/session --student={id} --topic={slug or name} --mode={explore|deepen|recall}`
2. The skill loads: `teacher_persona.md` + `session_start.md` + the relevant vault files
3. Teach. At session end the teacher outputs a `SESSION_LOG` block.
4. Run `/signal-extraction` — updates the topic file, signals, and writes the session log

### Context loaded per session
- Always: `profile.md`, `topics/index.md`, recent signals (last 10)
- Deepen/Recall only: the full topic file for the current topic
- Related topics: summary line + status only (from wikilinks in the topic file)
- Never: full session history, full signals file, other students' files

---

## Adding a new student
Copy `students/template/` → `students/{name}/`. Run onboarding.

## Key design decisions
- **No pre-built wiki** — Claude's general knowledge handles content; the vault handles personalization
- **No vector DB / RAG** — markdown files are the context store; Claude reads them directly
- **Wikilinks, not folders** — topics link to related topics via `[[slug]]` syntax; no area taxonomy
- **Tags for filtering** — topics have `tags: history, philosophy` etc. as metadata, not folder structure
- **Folder-scoped isolation** — one folder per student; no branch-per-student complexity
