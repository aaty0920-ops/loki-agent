---
name: live-translate
description: Voice-to-voice + live subtitle + image-text translation, wraps live-stream STT/TTS.
version: 1.0.0
metadata:
  loki:
    tags: [translation, voice, live]
    related_skills: [live-stream]
---

# Live Translate
```
audio in (lang A) -> STT -> translate -> TTS (lang B), streamed
video/image text -> OCR -> translate -> overlay/subtitle
```
Config: `live.translate.target_lang`. Reuses live-stream session, no separate pipeline.
