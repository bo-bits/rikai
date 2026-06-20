# Rikai — Claude Code Instructions

## On project open

Check `students/` for an existing student folder matching the current user.

- **No student folder exists** → run onboarding: load `system/prompts/onboarding.md` and `system/teacher_persona.md` as your system context, then begin the interview.
- **Student folder exists, no recent session** → greet them, show 2-3 topic suggestions from their `topics/index.md`, and ask what they want to do today.
- **Student folder exists** → pick up where they left off using the open thread in the most recently visited topic file.

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
