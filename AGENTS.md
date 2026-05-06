# AGENTS.md

## Python version
- Python 3.14+ required (see `.python-version`, `requires-python` in `pyproject.toml`).

## Package management
- Use **uv** for all dependency operations. `uv.lock` is checked in.
- Virtual env is at `.venv/`. Run via `uv run` or activate `.venv/bin/activate`.

## Application
- Flask app with Flask-SQLAlchemy. Production WSGI server is Waitress.
- App factory: `app/__init__.py` → `create_app()`.
- Blueprint: `app/devices/` with prefix `/devices`.
- SQLite DB stored at `<project_root>/data/wol.db` (auto-created).
- Models in `app/models.py`, utilities in `app/utils.py`.

## Run
```bash
uv run flask --app app run              # dev server
uv run python wsgi.py                   # production (Waitress)
```
