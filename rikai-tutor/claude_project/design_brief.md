# rickai — Design Brief

## The problem

Most people want to learn things but don't know where to start, lose motivation, or forget what they've learned. AI chatbots can teach but have no memory — every session starts from zero. Existing platforms (Duolingo, Coursera) are rigid, gamified, and don't adapt to *how you specifically think*.

## The insight

The value isn't the content — Claude already knows everything. The value is the **context layer**: knowing this student, what they've explored, what lights them up, what doesn't stick, and using that to teach them better every session.

## The user

Someone intellectually curious who wants to go deep on topics — history, philosophy, science, economics, film, whatever — but doesn't have a structured way to do it. Not a student prepping for an exam. Someone learning for the love of it. The "A Thousand Splendid Suns → Afghan history rabbit hole" type.

## The core loop

```
Student picks topic or area
        ↓
Teacher assesses what they know (exploration) or recalls last session (recall)
        ↓
Teaches via Socratic dialogue → student explains back
        ↓
Session ends → signals extracted, area updated, next session planned
        ↓
2-3 days later: recall session triggered
```

## What makes this different

1. **No pre-built content.** Claude generates everything. The curriculum is a scaffold, not a script.
2. **Signals, not scores.** No grades or points. The system learns from *curiosity signals* — what they reach for, not what they get right.
3. **Explain-back as the core mechanic.** Not flashcards, not MCQs. You've learned it when you can teach it.
4. **Interest-driven progression.** If a student learning Greek history keeps asking about philosophy, the teacher starts weaving in Socrates. The curriculum follows the curiosity.

## Key open questions for design

### Product
- What does the first session feel like? How do you onboard with zero prior context on a student?
- How is recall triggered? Push notification? The student opens the app and it decides?
- What's the UI for "explore a new topic"? Free text? Suggested areas? Both?
- Do students see their own signals/progress, or is that invisible scaffolding?

### Technical
- Where does signal extraction happen — inline (during session) or post-session pass?
- How do we handle long session history without blowing the context window?
- Multi-student on one repo: does each student get a branch, or is folder isolation enough?
- At what point does flat markdown need to become a database?

### Teaching
- How directive should the teacher be about what to study next vs. letting the student pick?
- When should the teacher introduce a connected concept the student didn't ask for?
- How do you handle a student who's clearly frustrated or disengaged mid-session?

## Decisions already made

| Decision | Choice | Reason |
|----------|--------|--------|
| LLM | Claude API | Best at long-form reasoning and instruction-following |
| Knowledge base format | Markdown files | Human-readable, git-friendly, no infra needed |
| RAG / vector DB | No | Claude is the knowledge base; files are student context only |
| Teaching method | Feynman technique | Explain-back is the strongest retention signal |
| Gamification | Minimal | Curiosity-driven, not reward-driven |
| Context scoping | App layer (not LLM) | Privacy + cost; LLM only sees current student's files |
