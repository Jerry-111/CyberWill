#!/bin/bash

# Kill any existing Next.js processes
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "typescript" 2>/dev/null

# Wait a moment
sleep 1

# Start Next.js dev server
echo "Starting Next.js dev server on port 3000..."
npm run dev
