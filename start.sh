#!/bin/bash
# Usage: ./start.sh <ngrok-url>
# Example: ./start.sh https://761e-91-84-97-233.ngrok-free.app

if [ -z "$1" ]; then
  echo "Usage: ./start.sh <ngrok-url>"
  echo "Example: ./start.sh https://xxxx.ngrok-free.app"
  exit 1
fi

URL="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill old instance
taskkill //F //FI "WINDOWTITLE eq node*" 2>/dev/null
pkill -f "node.*index.js" 2>/dev/null
# Also kill by port
PID=$(netstat -ano 2>/dev/null | grep ":3000.*LISTENING" | awk '{print $5}' | head -1)
[ -n "$PID" ] && taskkill //F //PID "$PID" 2>/dev/null
sleep 1

# Update .env
cat > "$DIR/backend/.env" << EOF
BOT_TOKEN=8619247086:AAHYE3ng5WIgAus3YHQKK7o0IKDMxifmYoQ
WEBAPP_URL=$URL
PORT=3000
NODE_ENV=production
EOF

echo "Starting with URL: $URL"
cd "$DIR/backend" && node src/index.js
