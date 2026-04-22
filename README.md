# Project Management MVP

## Local Run

Requirements:
- `uv`
- Node.js and npm for the frontend in later parts

If `uv` is not installed yet:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Start the backend scaffold:

```bash
./scripts/start_server_mac_linux.sh
```

This builds the frontend static export first, then starts FastAPI on `127.0.0.1:8000`.

Stop it:

```bash
./scripts/stop_server_mac_linux.sh
```

On Windows use:

```bat
scripts\start_server_windows.bat
scripts\stop_server_windows.bat
```

## Tests

```bash
$HOME/.local/bin/uv run --cache-dir .uv-cache pytest
```
