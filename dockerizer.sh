#!/bin/bash

# Determine which docker compose command is available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available."
    echo "💡 Please install Docker Compose."
    exit 1
fi

echo "--- Using: $DOCKER_COMPOSE_CMD ---"
echo "--- Stopping any previous containers... ---"
$DOCKER_COMPOSE_CMD -f docker-compose.yml down -v

if [ $? -ne 0 ]; then
    echo "Warning: 'docker compose down' failed. This might be the first run, which is okay. Continuing..."
fi

echo "--- Building and starting the application... ---"
$DOCKER_COMPOSE_CMD -f docker-compose.yml up --build -d

if [ $? -eq 0 ]; then
    echo "--- Application is now running! ---"
    echo "Access it at: http://localhost:6869"
    echo "To stop the application, run: $DOCKER_COMPOSE_CMD -f docker-compose.yml down"

    # === Try to launch Firefox with checks ===
    sleep 3  # Wait a bit for the server to start

    if [ -z "$DISPLAY" ]; then
        echo "⚠️  No GUI detected (DISPLAY is not set). Cannot launch Firefox."
        echo "💡 Open http://localhost:6869 manually in your browser."
    elif ! command -v firefox &> /dev/null; then
        echo "⚠️  Firefox is not installed."
        echo "💡 Install it with: sudo apt install firefox"
    else
        echo "🚀 Launching Firefox..."
        firefox http://localhost:6869 &
    fi
else
    echo "❌ Docker Compose failed. Check Docker is running and docker-compose.yml is correct."
    exit 1
fi
