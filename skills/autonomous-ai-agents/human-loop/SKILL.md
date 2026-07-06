---
name: human-loop
description: |
  Autonomous perceive-act loop combining mic (wake word + continuous +
  push-to-talk), screen (computer_use capture), and action (keyboard/
  mouse via computer_use). Load whenever the user wants Loki to act
  on its own without an explicit per-step prompt.
version: 1.0.0
metadata:
  loki:
    tags: [voice, computer-use, autonomy, loop]
    related_skills: [computer-use]
---

# Human Loop

Combines three existing primitives into one always-on loop. Do not
reimplement mic/keyboard/mouse — they already exist (`_voice_*` in
cli.py, `computer_use` tool). This skill only adds the orchestration.

## Trigger modes (all active simultaneously)

1. **Wake word** — passive listen, buffer discarded until wake phrase
   matches; then treat next utterance as a command.
2. **Continuous** — every finalized STT segment is treated as a
   command candidate (no wake word needed); use intent-confidence
   threshold to reject ambient chatter.
3. **Push-to-talk** — `Ctrl+B` (existing `_voice_record_key`) always
   overrides 1/2 immediately, takes priority.

## Loop

```
on_start:
  computer_use(action="capture", mode="som")  # baseline state

on_audio_segment(text, source):  # source = wake|continuous|ptt
  if source == "continuous" and intent_confidence(text) < THRESHOLD:
      discard; continue
  run_command(text)

after_any_action:
  computer_use(action="capture", mode="som", capture_after=True)
  # re-check screen state before next action — don't act blind
```

## Priority / interrupt rules

- PTT always preempts wake/continuous mid-buffer.
- Never act on screen while a `computer_use` action from the previous
  turn hasn't been verified with a follow-up capture.
- Idle timeout on continuous mode reverts to wake-word-only to save
  CPU/tokens when nothing relevant is happening.

## Config keys (add to loki config, do not hardcode)

```yaml
voice:
  mode: continuous        # wake | continuous | ptt | all
  wake_word: "loki"
  confidence_threshold: 0.6
  idle_timeout_s: 120
```
