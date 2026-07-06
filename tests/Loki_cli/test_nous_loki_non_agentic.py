"""Tests for the Nous-Loki-3/4 non-agentic warning detector.

Prior to this check, the warning fired on any model whose name contained
``"loki"`` anywhere (case-insensitive). That false-positived on unrelated
local Modelfiles such as ``loki-brain:qwen3-14b-ctx16k`` — a tool-capable
Qwen3 wrapper that happens to live under the "loki" tag namespace.

``is_nous_loki_non_agentic`` should only match the actual Nous Research
Loki-3 / Loki-4 chat family.
"""

from __future__ import annotations

import pytest

from loki_cli.model_switch import (
    _LOKI_MODEL_WARNING,
    _check_loki_model_warning,
    is_nous_loki_non_agentic,
)


@pytest.mark.parametrize(
    "model_name",
    [
        "NousResearch/Loki-3-Llama-3.1-70B",
        "NousResearch/Loki-3-Llama-3.1-405B",
        "loki-3",
        "Loki-3",
        "loki-4",
        "loki-4-405b",
        "loki_4_70b",
        "openrouter/loki3:70b",
        "openrouter/nousresearch/loki-4-405b",
        "NousResearch/Loki3",
        "loki-3.1",
    ],
)
def test_matches_real_nous_loki_chat_models(model_name: str) -> None:
    assert is_nous_loki_non_agentic(model_name), (
        f"expected {model_name!r} to be flagged as Nous Loki 3/4"
    )
    assert _check_loki_model_warning(model_name) == _LOKI_MODEL_WARNING


@pytest.mark.parametrize(
    "model_name",
    [
        # Kyle's local Modelfile — qwen3:14b under a custom tag
        "loki-brain:qwen3-14b-ctx16k",
        "loki-brain:qwen3-14b-ctx32k",
        "loki-honcho:qwen3-8b-ctx8k",
        # Plain unrelated models
        "qwen3:14b",
        "qwen3-coder:30b",
        "qwen2.5:14b",
        "claude-opus-4-6",
        "anthropic/claude-sonnet-4.5",
        "gpt-5",
        "openai/gpt-4o",
        "google/gemini-2.5-flash",
        "deepseek-chat",
        # Non-chat Loki models we don't warn about
        "loki-llm-2",
        "loki2-pro",
        "nous-loki-2-mistral",
        # Edge cases
        "",
        "loki",  # bare "loki" isn't the 3/4 family
        "loki-brain",
        "brain-loki-3-impostor",  # "3" not preceded by /: boundary
    ],
)
def test_does_not_match_unrelated_models(model_name: str) -> None:
    assert not is_nous_loki_non_agentic(model_name), (
        f"expected {model_name!r} NOT to be flagged as Nous Loki 3/4"
    )
    assert _check_loki_model_warning(model_name) == ""


def test_none_like_inputs_are_safe() -> None:
    assert is_nous_loki_non_agentic("") is False
    # Defensive: the helper shouldn't crash on None-ish falsy input either.
    assert _check_loki_model_warning("") == ""
