#!/bin/bash
# BugTrace-AI Dockerizer Script (using Docker Compose)
# This script builds and runs the application using docker-compose.

echo "--- Stopping any previous containers... ---"
# Stop and remove containers, volumes, and networks created by 'up'.
# The '-v' flag removes named volumes, ensuring a clean state.
docker-compose -f docker-compose.yml down -v

if [ $? -ne 0 ]; then
    echo "Warning: 'docker-compose down' failed. This might be the first run, which is okay. Continuing..."
fi

echo "--- Building and starting the application... ---"
# Build the image if it doesn't exist (or if the Dockerfile has changed)
# and start the services in detached mode (-d).
docker-compose -f docker-compose.yml up --build -d

if [ $? -eq 0 ]; then
    echo "--- Application is now running! ---"
    echo "Access it at: http://localhost:6869"
    echo "To stop the application, run: docker-compose -f docker-compose.yml down"
    
    # Lanzar Firefox y abrir la URL
    echo "Launching Firefox..."
    firefox http://localhost:6869 &
else
    echo "Error: Docker Compose failed. Please ensure Docker and docker-compose are installed and running."
    exit 1
fi
