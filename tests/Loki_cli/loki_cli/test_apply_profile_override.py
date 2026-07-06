"""Regression tests for _apply_profile_override LOKI_HOME guard (issue #22502).

When LOKI_HOME is set to the loki root (e.g. systemd hardcodes
LOKI_HOME=/root/.loki), _apply_profile_override must still read
active_profile and update LOKI_HOME to the profile directory.

When LOKI_HOME is already a profile directory (.../profiles/<name>),
_apply_profile_override must trust it and return without re-reading
active_profile (child-process inheritance contract).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from types import SimpleNamespace



def _run_apply_profile_override(
    tmp_path, monkeypatch, *, loki_home: str | None, active_profile: str | None,
    argv: list[str] | None = None,
):
    """Run _apply_profile_override in isolation.

    Returns the value of os.environ["LOKI_HOME"] after the call,
    or None if unset.
    """
    loki_root = tmp_path / ".loki"
    loki_root.mkdir(parents=True, exist_ok=True)

    if active_profile is not None:
        (loki_root / "active_profile").write_text(active_profile)

    if active_profile and active_profile != "default":
        (loki_root / "profiles" / active_profile).mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    if loki_home is not None:
        monkeypatch.setenv("LOKI_HOME", loki_home)
    else:
        monkeypatch.delenv("LOKI_HOME", raising=False)

    monkeypatch.setattr(sys, "argv", argv or ["loki", "gateway", "start"])

    from loki_cli.main import _apply_profile_override
    _apply_profile_override()

    return os.environ.get("LOKI_HOME")


class TestApplyProfileOverrideLokiHomeGuard:
    """Regression guard for issue #22502.

    Verifies that LOKI_HOME pointing to the loki root does NOT suppress
    the active_profile check, while LOKI_HOME already pointing to a
    profile directory IS trusted as-is.
    """

    def test_loki_home_at_root_with_active_profile_is_redirected(
        self, tmp_path, monkeypatch
    ):
        """LOKI_HOME=/root/.loki + active_profile=coder must redirect
        LOKI_HOME to .../profiles/coder.

        Bug scenario from #22502: systemd sets LOKI_HOME to the loki root
        and the user switches to a profile via `loki profile use`.
        Before the fix, the guard returned early and active_profile was ignored.
        """
        loki_root = tmp_path / ".loki"
        loki_root.mkdir(parents=True, exist_ok=True)

        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=str(loki_root),
            active_profile="coder",
        )

        assert result is not None, "LOKI_HOME must be set after profile redirect"
        assert "profiles" in result, (
            f"Expected LOKI_HOME to point into profiles/ dir, got: {result!r}"
        )
        assert result.endswith("coder"), (
            f"Expected LOKI_HOME to end with 'coder', got: {result!r}"
        )

    def test_loki_home_already_profile_dir_is_trusted(self, tmp_path, monkeypatch):
        """LOKI_HOME=.../profiles/coder must not be overridden even when
        active_profile says something different.

        Preserves the child-process inheritance contract: a subprocess spawned
        with LOKI_HOME already set to a specific profile must stay in that
        profile.
        """
        loki_root = tmp_path / ".loki"
        profile_dir = loki_root / "profiles" / "coder"
        profile_dir.mkdir(parents=True, exist_ok=True)

        (loki_root / "active_profile").write_text("other")

        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.setenv("LOKI_HOME", str(profile_dir))
        monkeypatch.setattr(sys, "argv", ["loki", "gateway", "start"])

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        assert os.environ.get("LOKI_HOME") == str(profile_dir), (
            "LOKI_HOME must remain unchanged when already pointing to a profile dir"
        )

    def test_loki_home_unset_reads_active_profile(self, tmp_path, monkeypatch):
        """Classic case: LOKI_HOME unset + active_profile=coder must set
        LOKI_HOME to the profile directory (existing behaviour must not regress).
        """
        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=None,
            active_profile="coder",
        )

        assert result is not None
        assert "coder" in result

    def test_sudo_explicit_profile_resolves_invoking_users_profile(self, tmp_path, monkeypatch):
        """sudo elias ... should resolve `-p elias` under SUDO_USER, not root."""
        root_home = tmp_path / "root"
        user_home = tmp_path / "home" / "loki"
        profile_dir = user_home / ".loki" / "profiles" / "elias"
        profile_dir.mkdir(parents=True, exist_ok=True)
        (root_home / ".loki").mkdir(parents=True, exist_ok=True)

        monkeypatch.setattr(Path, "home", lambda: root_home)
        monkeypatch.setenv("SUDO_USER", "loki")
        monkeypatch.delenv("LOKI_HOME", raising=False)
        monkeypatch.setattr(os, "geteuid", lambda: 0, raising=False)
        monkeypatch.setattr(sys, "argv", ["loki", "-p", "elias", "gateway", "install", "--system"])

        import pwd

        monkeypatch.setattr(pwd, "getpwnam", lambda name: SimpleNamespace(pw_dir=str(user_home)))

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        assert os.environ.get("LOKI_HOME") == str(profile_dir)
        assert sys.argv == ["loki", "gateway", "install", "--system"]

    def test_loki_home_unset_default_profile_no_redirect(self, tmp_path, monkeypatch):
        """active_profile=default must not redirect LOKI_HOME."""
        loki_root = tmp_path / ".loki"
        loki_root.mkdir(parents=True, exist_ok=True)

        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("LOKI_HOME", raising=False)
        monkeypatch.setattr(sys, "argv", ["loki", "gateway", "start"])
        (loki_root / "active_profile").write_text("default")

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        assert os.environ.get("LOKI_HOME") is None

    def test_subcommand_profile_flag_is_not_consumed(self, tmp_path, monkeypatch):
        """Command argv flags named --profile must stay with that command.

        Docker Desktop's MCP Toolkit uses `docker mcp gateway run --profile ...`.
        When that argv is passed through `loki mcp add --args`, the early
        profile pre-parser must not interpret the Docker profile as a Loki
        profile.
        """
        loki_root = tmp_path / ".loki"
        loki_root.mkdir(parents=True, exist_ok=True)
        argv = [
            "loki",
            "mcp",
            "add",
            "docker-research",
            "--command",
            "docker",
            "--args",
            "mcp",
            "gateway",
            "run",
            "--profile",
            "research",
        ]

        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("LOKI_HOME", raising=False)
        monkeypatch.setattr(sys, "argv", list(argv))

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        assert os.environ.get("LOKI_HOME") is None
        assert sys.argv == argv

    def test_profile_after_chat_subcommand_is_still_consumed(self, tmp_path, monkeypatch):
        """Profile flags historically work after normal Loki subcommands."""
        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=None,
            active_profile="coder",
            argv=["loki", "chat", "-p", "coder", "-q", "hello"],
        )

        assert result is not None
        assert result.endswith("coder")
        assert sys.argv == ["loki", "chat", "-q", "hello"]

    def test_top_level_profile_after_value_flag_is_consumed(self, tmp_path, monkeypatch):
        """Top-level --profile still works after other top-level value flags."""
        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=None,
            active_profile="coder",
            argv=["loki", "-m", "gpt-5", "--profile", "coder", "chat"],
        )

        assert result is not None
        assert result.endswith("coder")
        assert sys.argv == ["loki", "-m", "gpt-5", "chat"]

    def test_top_level_profile_after_continue_flag_is_consumed(self, tmp_path, monkeypatch):
        """--continue has an optional value, so a following --profile is a flag."""
        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=None,
            active_profile="coder",
            argv=["loki", "--continue", "--profile", "coder"],
        )

        assert result is not None
        assert result.endswith("coder")
        assert sys.argv == ["loki", "--continue"]


class TestSupervisedChildIgnoresStickyProfile:
    """The reserved default gateway s6 slot must not follow active_profile.

    Inside the Docker s6 image the ``gateway-default`` service slot runs a
    bare ``loki gateway run`` (no ``-p``) to mean "the root LOKI_HOME
    profile". The run-script exports ``LOKI_S6_SUPERVISED_CHILD=1``.
    Without a guard, ``_apply_profile_override`` would read the sticky
    ``active_profile`` file (set by e.g. the dashboard profile switcher) and
    redirect the reserved default gateway into that profile — producing a
    duplicate gateway for the active profile and no real default gateway.
    """

    def test_supervised_child_does_not_follow_active_profile(
        self, tmp_path, monkeypatch
    ):
        """LOKI_S6_SUPERVISED_CHILD + active_profile=briefer must NOT redirect.

        Reproduces the Docker/profile scoping bug: the supervised default
        gateway is launched as bare ``loki gateway run`` with
        LOKI_HOME=/opt/data (the container root, whose parent is NOT
        ``profiles``), and a sticky ``active_profile`` of another profile.
        The reserved default slot must stay on the root profile.
        """
        loki_root = tmp_path / ".loki"
        loki_root.mkdir(parents=True, exist_ok=True)
        (loki_root / "active_profile").write_text("briefer")
        (loki_root / "profiles" / "briefer").mkdir(parents=True, exist_ok=True)

        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        # Container root LOKI_HOME: parent dir is NOT "profiles", so the
        # #22502 guard does not short-circuit — step 2 (active_profile) runs.
        monkeypatch.setenv("LOKI_HOME", str(loki_root))
        monkeypatch.setenv("LOKI_S6_SUPERVISED_CHILD", "1")
        monkeypatch.setattr(sys, "argv", ["loki", "gateway", "run"])

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        assert os.environ.get("LOKI_HOME") == str(loki_root), (
            "Supervised default gateway must stay on the root profile, not be "
            f"hijacked by active_profile; got {os.environ.get('LOKI_HOME')!r}"
        )

    def test_non_supervised_run_still_follows_active_profile(
        self, tmp_path, monkeypatch
    ):
        """Without the sentinel, a normal `loki gateway run` still honors
        active_profile — the guard is scoped strictly to supervised children."""
        result = _run_apply_profile_override(
            tmp_path,
            monkeypatch,
            loki_home=None,
            active_profile="briefer",
            argv=["loki", "gateway", "run"],
        )

        assert result is not None
        assert result.endswith("briefer")

    def test_supervised_named_profile_flag_still_wins(self, tmp_path, monkeypatch):
        """A supervised named-profile slot passes ``-p <name>`` explicitly;
        that must still resolve (the sentinel guard only skips the sticky
        active_profile fallback, never an explicit flag)."""
        loki_root = tmp_path / ".loki"
        loki_root.mkdir(parents=True, exist_ok=True)
        (loki_root / "active_profile").write_text("briefer")
        (loki_root / "profiles" / "briefer").mkdir(parents=True, exist_ok=True)
        (loki_root / "profiles" / "coder").mkdir(parents=True, exist_ok=True)

        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("LOKI_HOME", raising=False)
        monkeypatch.setenv("LOKI_S6_SUPERVISED_CHILD", "1")
        monkeypatch.setattr(sys, "argv", ["loki", "-p", "coder", "gateway", "run"])

        from loki_cli.main import _apply_profile_override
        _apply_profile_override()

        result = os.environ.get("LOKI_HOME")
        assert result is not None
        assert result.endswith("coder")

