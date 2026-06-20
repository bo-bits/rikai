# Skill: /signal-extraction

_Run this after every session (and after onboarding, with --mode=onboarding). It reads the session log and updates the vault._

## When to run
After the SESSION_LOG block has been output at the end of a session. Copy the conversation or the log block, then run `/signal-extraction`.

## V0 usage (Claude Code)
Paste the SESSION_LOG block into Claude Code and run:
```
/signal-extraction
```
Or for onboarding:
```
/signal-extraction --mode=onboarding
```

---

## What this skill does

Given the SESSION_LOG block (or the full conversation for onboarding), output the following updates. A human or script then applies them to the vault files.

---

## Output format

### 1. Topic file update
_Write this to `students/{id}/topics/{slug}.md` (create if new topic)_

```
## TOPIC_UPDATE
slug: {topic-slug}
title: {Topic Name}
status: exploring | developing | solid | mastered
confidence: low | medium | high
last_visited: YYYY-MM-DD

what_they_know: |
  {updated description of their accurate mental model}

misconceptions:
  - {only new ones from this session; omit if none}

what_clicked:
  - {specific things from this session}

open_thread: {the hook for next Deepen session}

related:
  - [[{any topics they connected to unprompted}]]

tags: {comma-separated domains, unchanged unless new ones emerged}
```

### 2. Signals update
_Prepend to `students/{id}/signals.md`_

```
## SIGNALS_UPDATE
entries:
  - date: YYYY-MM-DD
    type: reaches-for | avoids | lights-up | confused-by | explains-well
    observation: {what happened}
    significance: {why it matters for future sessions}
    source: sessions/{date}-{slug}.md
```

_Only extract signals that are actually meaningful. 0-3 per session is normal. Don't manufacture signals._

### 3. Topics index update
_Update the row in `students/{id}/topics/index.md`_

```
## INDEX_UPDATE
slug: {topic-slug}
title: {Topic Name}
status: {updated status}
last_visited: YYYY-MM-DD
tags: {tags}
```

### 4. Session file
_Write the session log to `students/{id}/sessions/{date}-{slug}.md` using the session template._

---

## Signal extraction rules

- **reaches-for**: student asked about something adjacent that wasn't in the session plan. Strong signal.
- **avoids**: student deflected, gave short answers, or changed subject when a particular angle came up. Note without judgment.
- **lights-up**: follow-up questions, enthusiasm, went beyond what was asked. Log the specific moment.
- **confused-by**: recurring sticking point. Only log if it came up more than once or they explicitly said they don't get it.
- **explains-well**: they explained something back accurately and in their own words. Upgrade confidence and potentially status.

Don't infer what isn't there. If the session was neutral and unremarkable, a short INDEX_UPDATE and a session file is enough.
