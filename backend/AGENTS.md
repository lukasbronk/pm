# Backend Agent Guide

This directory contains the local FastAPI backend for the project.

## Current Scope

- Serve the frontend static export from `/`
- Expose `/api/health` for local runtime verification
- Handle local signed-cookie auth for the MVP
- Persist one board per user in local SQLite
- Load local configuration from the root `.env`
- Bind to `127.0.0.1` by default

## Key Files

- `backend/app/main.py`: FastAPI app, auth routes, and board API routes
- `backend/app/database.py`: SQLite schema, board validation, and persistence helpers
- `backend/app/settings.py`: local settings loaded from `.env`
- `backend/tests/test_app.py`: backend route tests

## Conventions

- Keep the backend local-only unless the plan changes explicitly
- Keep API shapes simple and aligned with the frontend data model
- Avoid introducing deployment complexity before it is needed
