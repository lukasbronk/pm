@echo off
setlocal

set ROOT_DIR=%~dp0..
set RUN_DIR=%ROOT_DIR%\.run
set PID_FILE=%RUN_DIR%\server.pid
set UV_BIN=%USERPROFILE%\.local\bin\uv.exe
set UV_CACHE_DIR=%ROOT_DIR%\.uv-cache

if not exist "%RUN_DIR%" mkdir "%RUN_DIR%"
if not exist "%UV_CACHE_DIR%" mkdir "%UV_CACHE_DIR%"

pushd "%ROOT_DIR%"
call npm --prefix "%ROOT_DIR%\frontend" install
call npm --prefix "%ROOT_DIR%\frontend" run build
call "%UV_BIN%" sync --cache-dir "%UV_CACHE_DIR%"
start "pm-server" /b cmd /c ""%UV_BIN%" run --cache-dir "%UV_CACHE_DIR%" uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 > .run\server.log 2>&1"
echo Server started on http://127.0.0.1:8000
echo Use scripts\stop_server_windows.bat to stop it.
popd
