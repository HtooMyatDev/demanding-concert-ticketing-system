#!/bin/bash

# Navigate to app directory
cd ~/concert-ticketing-system

# Pull latest changes
git pull origin master

# Build and restart containers
docker compose up -d --build

echo "Deployment successful."
