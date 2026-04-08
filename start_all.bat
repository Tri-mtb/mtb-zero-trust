@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "LOG_DIR=%ROOT%logs"
set "AI_PYTHON=%ROOT%ai-engine\venv\Scripts\python.exe"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo Starting Zero Trust E-commerce System...
echo Root: %ROOT%
echo Logs: %LOG_DIR%
echo.

if not exist "%AI_PYTHON%" (
  echo ERROR: Missing ai-engine\venv. Create it first:
  echo   cd ai-engine
  echo   python -m venv venv
  echo   venv\Scripts\pip install -r requirements.txt
  exit /b 1
)

if not exist "%ROOT%ai-engine\.env" (
  echo ERROR: Missing ai-engine\.env
  echo Copy ai-engine\.env.example to ai-engine\.env and configure it.
  exit /b 1
)

if not exist "%ROOT%gateway\.env" (
  echo ERROR: Missing gateway\.env
  exit /b 1
)

if not exist "%ROOT%protected-api\.env" (
  echo ERROR: Missing protected-api\.env
  exit /b 1
)

if not exist "%ROOT%frontend\.env.local" (
  echo ERROR: Missing frontend\.env.local
  exit /b 1
)

if not exist "%ROOT%frontend\node_modules" (
  echo ERROR: Missing frontend\node_modules. Run npm install in frontend first.
  exit /b 1
)

if not exist "%ROOT%gateway\node_modules" (
  echo ERROR: Missing gateway\node_modules. Run npm install in gateway first.
  exit /b 1
)

if not exist "%ROOT%protected-api\node_modules" (
  echo ERROR: Missing protected-api\node_modules. Run npm install in protected-api first.
  exit /b 1
)

for %%P in (3000 4000 5000 8080) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul
  if not errorlevel 1 (
    echo WARNING: Port %%P is already in use. Existing processes may conflict with startup.
  )
)

echo.
echo Starting AI Engine ^(PDP^)...
start "AI Engine" cmd /k "cd /d %ROOT%ai-engine && echo Logging to %LOG_DIR%\ai-engine.log && \"%AI_PYTHON%\" main.py >> \"%LOG_DIR%\ai-engine.log\" 2>&1"

echo Starting Protected API...
start "Protected API" cmd /k "cd /d %ROOT%protected-api && echo Logging to %LOG_DIR%\protected-api.log && npm run start >> \"%LOG_DIR%\protected-api.log\" 2>&1"

echo Starting Gateway...
start "Gateway" cmd /k "cd /d %ROOT%gateway && echo Logging to %LOG_DIR%\gateway.log && npm run start >> \"%LOG_DIR%\gateway.log\" 2>&1"

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %ROOT%frontend && echo Logging to %LOG_DIR%\frontend.log && npm run dev >> \"%LOG_DIR%\frontend.log\" 2>&1"

echo.
echo Services:
echo - AI Engine: http://localhost:5000
echo - Protected API: http://localhost:4000
echo - Gateway: http://localhost:8080
echo - Frontend: http://localhost:3000
echo.
echo Log files:
echo - %LOG_DIR%\ai-engine.log
echo - %LOG_DIR%\protected-api.log
echo - %LOG_DIR%\gateway.log
echo - %LOG_DIR%\frontend.log
