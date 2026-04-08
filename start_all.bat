@echo off
setlocal

echo Starting Zero Trust E-commerce System...
echo.
echo Prerequisites:
echo - Dependencies are already installed for frontend, gateway, and protected-api
echo - Python virtual environment is already prepared in ai-engine\venv
echo - .env files are configured
echo - gateway\.env and protected-api\.env share the same INTERNAL_GATEWAY_SECRET
echo.

if not exist "ai-engine\venv\Scripts\python.exe" (
  echo ERROR: Missing ai-engine\venv. Create it first:
  echo   cd ai-engine
  echo   python -m venv venv
  echo   venv\Scripts\pip install -r requirements.txt
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo ERROR: Missing frontend\node_modules. Run npm install in frontend first.
  exit /b 1
)

if not exist "gateway\node_modules" (
  echo ERROR: Missing gateway\node_modules. Run npm install in gateway first.
  exit /b 1
)

if not exist "protected-api\node_modules" (
  echo ERROR: Missing protected-api\node_modules. Run npm install in protected-api first.
  exit /b 1
)

echo Starting AI Engine (PDP)...
start "AI Engine" cmd /k "cd /d %~dp0ai-engine && call venv\Scripts\activate && python main.py"

echo Starting Protected API...
start "Protected API" cmd /k "cd /d %~dp0protected-api && npm run start"

echo Starting Gateway...
start "Gateway" cmd /k "cd /d %~dp0gateway && npm run start"

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Services:
echo - AI Engine: http://localhost:5000
echo - Protected API: http://localhost:4000
echo - Gateway: http://localhost:8080
echo - Frontend: http://localhost:3000
