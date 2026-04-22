@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1
echo Stop command sent for processes bound to port 8000.
