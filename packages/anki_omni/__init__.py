"""
Anki Omni Accessibility — complete accessibility toolbar for Anki.

By Axol Assist · https://axolassist.com/anki-omni/
"""


def _bootstrap() -> None:
    try:
        from .hooks import register_hooks

        register_hooks()
    except Exception as exc:
        import traceback

        from aqt.utils import showWarning

        showWarning(
            "Anki Omni Accessibility could not load.\n\n"
            f"{exc}\n\n{traceback.format_exc()}"
        )


_bootstrap()
