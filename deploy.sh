#!/bin/bash
set -e

SERVER="root@10.93.25.214"
APP_DIR="/opt/innopolis-events"

echo "==> Deploying Innopolis Events to $SERVER..."

# Create app directory on server
ssh $SERVER "mkdir -p $APP_DIR"

# Copy project files to server
echo "==> Syncing files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'backend/data' \
  ./ $SERVER:$APP_DIR/

# Build and run on server
echo "==> Building and starting containers..."
ssh $SERVER "cd $APP_DIR && docker compose down 2>/dev/null; docker compose up -d --build"

echo "==> Deployment complete!"
echo "==> Site should be available at https://csrn-market.com"
