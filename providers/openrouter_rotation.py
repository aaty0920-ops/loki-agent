import itertools
import os
import requests

_KEYS = [v for k, v in os.environ.items() if k.startswith("OPENROUTER_API_KEY")]
_pool = itertools.cycle(_KEYS)


def next_key() -> str:
    return next(_pool)


def free_models() -> list[str]:
    r = requests.get("https://openrouter.ai/api/v1/models", timeout=10)
    return [m["id"] for m in r.json()["data"] if m["id"].endswith(":free")]


def call(payload: dict, key: str | None = None) -> requests.Response:
    key = key or next_key()
    return requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}"},
        json=payload,
        timeout=60,
    )
