# Skill: /session

_Assembles the context for a teaching session and runs it._

## V0 usage (Claude Code)

New topic (Explore mode):
```
/session --student={id} --topic="Roman Empire" --mode=explore
```

Returning to a known topic (Deepen mode):
```
/session --student={id} --topic={slug} --mode=deepen
```

Recall only:
```
/session --student={id} --topic={slug} --mode=recall
```

If `--mode` is omitted, infer from whether the topic exists in the student's topics index:
- Not in index → Explore
- In index, status is `exploring` or `developing` → Deepen
- Explicit `--mode=recall` required for recall

---

## What to load

1. `system/teacher_persona.md`
2. `system/prompts/session_start.md` (the assembled prompt)
3. `students/{id}/profile.md`
4. `students/{id}/topics/index.md`
5. If Deepen or Recall: `students/{id}/topics/{slug}.md`
6. Related topics (wikilinked from current topic): summary line + status only
7. `students/{id}/signals.md` — most recent 10 entries only

Do not load all session files or the full signals history. Keep the context window focused.

---

## After the session

Run `/signal-extraction` with the SESSION_LOG block the teacher outputs at session end.
