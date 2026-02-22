#!/bin/bash

echo "🛑 Stopping all services..."
pkill -f "nest start" || true
pkill -f "node server/index.js" || true
pkill -f "vite" || true

echo "🐳 Checking Data Infrastructure..."
if ! docker ps | grep -q "postgres"; then
    echo "   ⚠️ Postgres/Redis not running. Starting Docker Compose..."
    docker-compose up -d
else
    echo "   ✅ Docker Services active."
fi

echo "🚀 Starting NestJS Backend (Port 3000)..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   PID: $BACKEND_PID"

echo "bridge 🌉 Starting Node Proxy (Port 3001)..."
node server/index.js > proxy.log 2>&1 &
PROXY_PID=$!
echo "   PID: $PROXY_PID"

echo "🎨 Starting Frontend (Port 5173)..."
npm run dev > frontend.log 2>&1 &
FRONT_PID=$!
echo "   PID: $FRONT_PID"

echo "✅ All systems go!"
echo "   - Backend: http://localhost:3000/ingest"
echo "   - Proxy:   http://localhost:3001/config/sources"
echo "   - Frontend: http://localhost:5173"
echo "---------------------------------------------------"
echo "Logs: tail -f *.log"
