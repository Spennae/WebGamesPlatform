#!/bin/bash

echo "Starting WebGamesPlatform..."

# Start Docker containers
echo "Starting Docker containers..."
docker compose up -d

# Wait for MySQL to be healthy
echo "Waiting for MySQL..."
until docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
    sleep 1
done

echo "MySQL is ready!"

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
CDPID=$!

# Wait a moment for Vite to start
sleep 3

# Open browser
echo "Opening browser..."
xdg-open http://localhost:5173 2>/dev/null || open http://localhost:5173 2>/dev/null || echo "Please open http://localhost:5173 manually"

echo ""
echo "WebGamesPlatform is running!"
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:5000"
echo "  Swagger:  http://localhost:5000/swagger"
echo ""
echo "Press Ctrl+C to stop"

# Wait for the frontend process
wait $CDPID
