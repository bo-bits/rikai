# rickai — AI Teacher Knowledge Base

## Structure

```
rickai/
├── system/                  # How the AI teacher behaves
│   ├── teacher_persona.md   # Tone, Socratic rules, defaults
│   ├── prompts/             # System prompt templates
│   └── skills/              # What the LLM can do (e.g. update knowledge state)
│
├── students/                # Per-student memory (the core of personalization)
│   └── template/            # Copy this for each new student
│       ├── profile.md       # Who they are, goals, interests
│       ├── knowledge_state.md  # What they know right now
│       └── session_log.md   # Compressed history
│
├── wiki/                    # Subject matter, compiled and structured
│   ├── index.md             # Master list of all concepts
│   └── concepts/            # One file per concept
│
└── curriculum/
    └── paths/               # Ordered sequences of concepts
```

## How a session works

1. Load `system/teacher_persona.md` + `system/prompts/session_start.md` into the system prompt
2. Inject the student's `profile.md` and `knowledge_state.md`
3. Inject today's concept from `wiki/concepts/`
4. Run the session
5. At the end, the LLM outputs a `KNOWLEDGE_STATE_UPDATE` block
6. Parse it and append to the student's `knowledge_state.md` and `session_log.md`

## Adding a new student
Copy `students/template/` → `students/{name}/` and fill in `profile.md`.

## Adding a new concept
Copy `wiki/concepts/_template.md` → `wiki/concepts/{concept}.md`, fill it in, add a row to `wiki/index.md`.
