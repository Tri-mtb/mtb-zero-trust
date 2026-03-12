@echo off
echo Starting Zero Trust E-commerce System...

echo Starting AI Engine (PDP)...
start "AI Engine" cmd /c "cd ai-engine && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && python main.py"

echo Starting Protected API (Module A)...
start "Protected API" cmd /c "cd protected-api && npm install && node server.js"

echo Starting Zero Trust Gateway (Module B)...
start "Gateway" cmd /c "cd gateway && npm install && node server.js"

echo Starting Frontend...
start "Frontend" cmd /c "cd frontend && npm install && npm run dev"

echo All services started!
echo - AI Engine: http://localhost:5000
echo - Protected API: http://localhost:4000
echo - Gateway: http://localhost:8080
echo - Frontend: http://localhost:3000
pause
