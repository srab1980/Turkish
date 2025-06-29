#!/bin/bash

# Watch for changes and auto-deploy to VPS
# This script watches for file changes and automatically deploys to VPS

set -e

# Configuration
WATCH_DIRS="src pages components lib styles public"
DEPLOY_SCRIPT="./scripts/deploy-to-vps.sh"
DEBOUNCE_TIME=5  # seconds to wait after last change before deploying

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if inotify-tools is installed
if ! command -v inotifywait &> /dev/null; then
    log_warn "inotify-tools not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y inotify-tools
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install fswatch
    else
        log_warn "Please install file watching tools for your OS"
        exit 1
    fi
fi

# Check if deploy script exists
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    log_warn "Deploy script not found: $DEPLOY_SCRIPT"
    exit 1
fi

# Make deploy script executable
chmod +x "$DEPLOY_SCRIPT"

log_info "🔍 Starting file watcher for auto-deployment..."
log_info "Watching directories: $WATCH_DIRS"
log_info "Deploy script: $DEPLOY_SCRIPT"
log_info "Debounce time: ${DEBOUNCE_TIME}s"
log_info ""
log_info "Press Ctrl+C to stop watching"

# Function to deploy with debouncing
deploy_with_debounce() {
    local last_change_time=$(date +%s)
    
    while true; do
        sleep 1
        current_time=$(date +%s)
        time_diff=$((current_time - last_change_time))
        
        if [ $time_diff -ge $DEBOUNCE_TIME ]; then
            log_step "🚀 Deploying changes..."
            if $DEPLOY_SCRIPT; then
                log_info "✅ Deployment successful"
            else
                log_warn "❌ Deployment failed"
            fi
            break
        fi
    done
}

# Watch for file changes
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux with inotifywait
    inotifywait -m -r -e modify,create,delete,move $WATCH_DIRS --format '%w%f %e' |
    while read file event; do
        # Skip certain files
        if [[ $file == *".git"* ]] || [[ $file == *"node_modules"* ]] || [[ $file == *".next"* ]] || [[ $file == *".log" ]]; then
            continue
        fi
        
        log_info "📝 File changed: $file ($event)"
        deploy_with_debounce &
        
        # Kill previous deploy process if still running
        jobs -p | head -n -1 | xargs -r kill 2>/dev/null || true
    done
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS with fswatch
    fswatch -o $WATCH_DIRS |
    while read num_changes; do
        log_info "📝 $num_changes file(s) changed"
        deploy_with_debounce &
        
        # Kill previous deploy process if still running
        jobs -p | head -n -1 | xargs kill 2>/dev/null || true
    done
else
    log_warn "Unsupported OS for file watching"
    exit 1
fi
