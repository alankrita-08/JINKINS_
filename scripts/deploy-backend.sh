#!/bin/bash

# Deploy Backend to EC2
# This script runs on the EC2 instance

set -e

echo "Starting backend deployment..."

# Navigate to project directory
cd /home/ubuntu/interior-designer-portfolio || exit 1

# Pull latest code from repository
echo "Pulling latest code from repository..."
git pull origin main

# Install/update dependencies
echo "Installing dependencies..."
npm install --production

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart PM2 process
echo "Restarting application with PM2..."
pm2 restart ecosystem.config.js --update-env

# Save PM2 process list
pm2 save

echo "Backend deployment completed successfully!"
echo "Application is running on port 5000"
