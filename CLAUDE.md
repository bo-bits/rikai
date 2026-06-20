# Rikai — Claude Code Instructions

## On project open

**Step 1 — identify the student**

Check if `students/.current` exists.
- **Yes** → read it to get the student ID. Greet them by name and skip to Step 2.
- **No** → ask: "Welcome to Rikai. What's your name?" Use their answer as the student ID (lowercase, no spaces — e.g. "Jimmy" → `jimmy`).

**Step 2 — check for existing profile**

Check if `students/{id}/` exists.
- **No folder** → new student: run onboarding. Read `system/prompts/onboarding.md` and `system/teacher_persona.md` now, then begin the interview.
- **Folder exists** → returning student: read `students/{id}/profile.md` and `students/{id}/topics/index.md`, greet them by name, surface 2-3 topic suggestions, and ask what they want to do today.

---

## Onboarding — what to do automatically when it ends

When the `ONBOARDING_COMPLETE` block is output:

1. Create `students/{id}/` directory structure (copy from `students/template/`)
2. Write `students/{id}/profile.md` from the `profile:` fields in the block
3. Write `students/{id}/topics/index.md` — add a row for each topic in `topics_to_seed:`
4. For each seeded topic, create `students/{id}/topics/{slug}.md` from the template, pre-filling title, tags, and the student's reason for interest
5. Write `students/{id}/signals.md` with any interest signals surfaced during the interview
6. Write the student's ID to `students/.current`
7. Tell the student their vault is set up, then ask if they want to start learning right now or come back later

Do all of this without asking the student to do it manually.

---

## Starting a session

When the student says what they want to learn (or picks a suggestion), determine the mode automatically:

- Topic not in `students/{id}/topics/index.md` → **Explore**
- Topic in index, student wants to go further → **Deepen**  
- Student explicitly wants to test their memory, or you're triggering recall inline → **Recall**

Then read the files for that session before responding:

1. `system/teacher_persona.md` (if not already loaded)
2. `system/prompts/session_start.md`
3. `students/{id}/profile.md`
4. `students/{id}/topics/index.md`
5. `students/{id}/topics/{slug}.md` — only if Deepen or Recall mode
6. `students/{id}/signals.md` — last 10 entries only

Read these files now, before the first teaching message. Do not start teaching from memory.

---

## During a session — mid-session context pulls

You have access to the student's full vault. Use it.

**When to pull a topic file mid-session:**
- The student makes an unprompted connection to something ("this reminds me of what we said about X")
- The conversation drifts into territory that sounds like a topic in the index
- You want to know if they've explored something before referencing it

**How:** read `students/{id}/topics/index.md` (already loaded) to check if the topic exists, then read the full `students/{id}/topics/{slug}.md` if it does. Reference what they already know rather than re-teaching it from scratch.

**When to trigger inline recall:**
If the conversation connects to a topic the student has marked `solid` or `mastered`, pause and ask one specific recall question before continuing — "Before we go further — do you remember [specific thing from their topic file]?" Assess their answer, update the confidence field in the topic file if it's changed, then continue the session.

Don't interrupt flow for `exploring` or `developing` topics — those need deepening, not recall.

---

## Session end — what to do automatically

When the session is winding down (student signals they're done, or ~30 min has passed):

1. Ask the student to explain the main thing they learned in their own words
2. Assess their explanation honestly against what they actually covered
3. Output the `SESSION_LOG` block (format in `system/prompts/session_start.md`)
4. **Immediately run signal extraction** — read `system/skills/signal_extraction.md`, then process the SESSION_LOG and output the `TOPIC_UPDATE`, `SIGNALS_UPDATE`, `INDEX_UPDATE` blocks
5. **Apply the updates** — write them to the vault files without asking the student to do it
6. Remind the student to push:
```
git add students/ && git commit -m "session: {topic} YYYY-MM-DD" && git push
```

Do not wait for the student to ask for signal extraction. Run it automatically.

---

## Skills (manual overrides)

| Command | What it does |
|---------|-------------|
| `/onboard` | Force-run onboarding (e.g. for a new student on this machine) |
| `/session --topic="..." --mode={explore\|deepen\|recall}` | Force-start a session with specific parameters |
| `/signal-extraction` | Manually re-run signal extraction on the last session |
| `/recall --topic={slug}` | Trigger a standalone recall session on a specific topic |
