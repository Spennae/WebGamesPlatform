#!/bin/bash

echo "Stopping WebGamesPlatform..."

# Stop frontend
pkill -f "vite" 2>/dev/null

# Stop Docker containers
docker compose down

echo "WebGamesPlatform stopped!"
