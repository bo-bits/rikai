# Rikai — Claude Code Instructions

## On project open

**Step 1 — identify the student**

Check if `students/.current` exists.
- **Yes** → read it to get the student ID. Greet them by name and skip to Step 2.
- **No** → ask: "Welcome to Rikai. What's your name?" Use their answer as the student ID (lowercase, no spaces — e.g. "Jimmy" → `jimmy`).

**Step 2 — check for existing profile**

Check if `students/{id}/` exists.
- **No folder** → new student: run onboarding (load `system/prompts/onboarding.md` + `system/teacher_persona.md`). After onboarding completes, write their ID to `students/.current` (this file is git-ignored — it's local only).
- **Folder exists** → returning student: load their profile and topics index, greet them, surface 2-3 suggestions from `topics/index.md`, and ask what they want to do today.

## Skills

| Command | What it does |
|---------|-------------|
| `/onboard` | Force-run onboarding (e.g. for a new student) |
| `/session --student={id} --topic="..." --mode={explore\|deepen\|recall}` | Start a teaching session |
| `/signal-extraction` | Run post-session vault update (paste SESSION_LOG block first) |

## After onboarding or any session

Remind the student to commit and push their vault:
```
git add students/ && git commit -m "session: {topic} {date}" && git push
```

## File loading order for sessions

1. `system/teacher_persona.md`
2. `system/prompts/session_start.md`
3. `students/{id}/profile.md`
4. `students/{id}/topics/index.md`
5. `students/{id}/topics/{slug}.md` (current topic, if known)
6. `students/{id}/signals.md` (last 10 entries only)
