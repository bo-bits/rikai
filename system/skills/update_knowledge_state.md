# Skill: Update Knowledge State

At the end of every session, output the following block so the student's knowledge state file can be updated.

## Output Format

```
## KNOWLEDGE_STATE_UPDATE
concept: {concept name}
status: not_started | exploring | developing | solid | mastered
confidence: low | medium | high  (student's self-reported or inferred)
misconceptions:
  - {any misconceptions surfaced this session}
notes: {anything notable about how they reasoned or what clicked}
next_session_hook: {one question or idea to open with next time}
```

## Instructions
- Be honest about status. "Developing" means they get the idea but make errors. "Solid" means consistent accuracy with some understanding. "Mastered" means they can explain it to others.
- Misconceptions: only list ones that came up today. Don't repeat old ones unless they reappeared.
- next_session_hook: make it specific and tied to their interests if possible.
