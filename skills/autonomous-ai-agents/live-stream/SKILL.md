---
name: live-stream
description: |
  Gemini-Live-style always-on session: continuous audio+screen/camera
  in, streamed low-latency response out, interruptible mid-turn. Wraps
  human-loop + orchestrator into one persistent session instead of
  per-turn requests.
version: 1.0.0
metadata:
  loki:
    tags: [live, streaming, voice, multimodal]
    related_skills: [human-loop, orchestrator]
---

# Live Stream Mode

## Session loop
```
open_session:
  audio_in: continuous (reuse voice._voice_continuous)
  video_in: screen capture @ 1fps OR camera if requested (computer_use)
  out: token-stream response, TTS spoken as generated (not after full reply)

on_new_input WHILE responding:
  if input is interruption -> stop current generation, handle new input first
  else -> queue, handle after current turn

session_state: kept in memory across turns (no re-plan from zero each turn)
idle -> auto-close session after config.idle_timeout_s, flush summary to PROJECT_MEMORY.md
```

## Config
```yaml
live:
  enabled: true
  video_source: screen   # screen | camera | none
  fps: 1
  interruptible: true    # barge-in: stop TTS mid-sentence on new speech
  latency_target_ms: 500 # 300-700ms band; drop video fps first if missed
  emotion_aware_tts: true
  idle_timeout_s: 300
```

## Camera mode
Swap `video_source: camera` -> computer_use captures device camera
instead of screen; rest of pipeline (STT/decide/TTS) unchanged.

## Trigger
Voice/text phrase "Loki live" starts session (not a page-embedded button).
Floating overlay bubble (draggable, always-on-top, like Gemini's) appears
on trigger — mounts outside ChatPage tree, independent of page routing.

## UI entry points (Gemini-Live parity)
```
idle_bar:      "Ask <assistant>" pill -> tap mic = start voice
                                      -> tap camera icon = start live+camera
                                      -> "Share screen with Live" chip = start live+screen
in_call_bar:   [camera_toggle] [share_toggle] [expand] [mic_mute] [end_call]
expand_button: swaps camera<->screen source mid-session without ending call
end_call:      closes session, flush summary to PROJECT_MEMORY.md
```
Maps directly to `live.video_source` (camera/screen/none) + `interruptible`
+ `idle_timeout_s` already defined above — no new backend, just these
5 buttons wired to existing config toggles.

- Audio: existing `_voice_*` (cli.py)
- Screen/action: `computer_use` (computer-use skill)
- Multi-step decisions: orchestrator skill
This skill only adds the persistent bidirectional session wrapper.
