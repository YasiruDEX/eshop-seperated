#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Array of services to start
declare -a SERVICES=(
  "api-gateway:8080"
  "auth-service:6001"
  "catalogue-service:6002"
  "payment-service:6004"
  "checkout-service:6008"
  "order-service:6009"
  "inventory-service:6010"
  "customer-service:6006"
)

# Function to print header
print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}       🚀 ESHOP MICROSERVICES STARTUP SCRIPT 🚀${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

# Function to check if port is in use
check_port() {
  lsof -Pi :$1 >/dev/null 2>&1
  return $?
}

# Function to kill process on port
kill_port() {
  echo -e "${YELLOW}⚠️  Killing process on port $1...${NC}"
  lsof -ti:$1 | xargs kill -9 2>/dev/null || true
  sleep 1
}

# Function to start a service
start_service() {
  local service_name=$1
  local port=$2
  local service_path="$ROOT_DIR/$service_name"
  
  if [ ! -d "$service_path" ]; then
    echo -e "${RED}✗ Service directory not found: $service_path${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Starting $service_name on port $port...${NC}"
  
  # Check if port is already in use
  if check_port $port; then
    kill_port $port
  fi
  
  # Start the service in a new tmux window
  if command -v tmux &> /dev/null; then
    tmux new-window -t "eshop:$service_name" -n "$service_name" -c "$service_path" "npm run dev || npm start"
  else
    # Fallback: Start in background if tmux is not available
    cd "$service_path"
    npm run dev > "$ROOT_DIR/logs/${service_name}.log" 2>&1 &
    echo $! > "$ROOT_DIR/.pids/${service_name}.pid"
    cd "$ROOT_DIR"
  fi
  
  echo -e "${GREEN}✓ $service_name started${NC}"
}

# Main execution
main() {
  print_header
  
  # Create logs and pids directories
  mkdir -p "$ROOT_DIR/logs"
  mkdir -p "$ROOT_DIR/.pids"
  
  echo -e "${BLUE}Starting all services...${NC}\n"
  
  # Check if tmux is available
  if command -v tmux &> /dev/null; then
    # Create a new tmux session
    tmux new-session -d -s "eshop" -x 200 -y 50
    echo -e "${GREEN}✓ Created tmux session 'eshop'${NC}\n"
    
    # Start all services
    for service_info in "${SERVICES[@]}"; do
      IFS=':' read -r service_name port <<< "$service_info"
      start_service "$service_name" "$port"
      sleep 2
    done
    
    echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ All services started successfully!${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}To view services, use:${NC}"
    echo -e "  ${BLUE}tmux attach -t eshop${NC}"
    echo -e "  ${BLUE}tmux list-windows -t eshop${NC}\n"
    
    echo -e "${YELLOW}To switch between services in tmux:${NC}"
    echo -e "  ${BLUE}Ctrl+B N${NC} (next window)"
    echo -e "  ${BLUE}Ctrl+B P${NC} (previous window)"
    echo -e "  ${BLUE}Ctrl+B <number>${NC} (go to specific window)\n"
    
    echo -e "${YELLOW}Services Status:${NC}"
    for service_info in "${SERVICES[@]}"; do
      IFS=':' read -r service_name port <<< "$service_info"
      echo -e "  ${GREEN}✓${NC} $service_name (port $port)"
    done
    
    echo -e "\n${YELLOW}To stop all services:${NC}"
    echo -e "  ${BLUE}tmux kill-session -t eshop${NC}\n"
    
  else
    # Fallback without tmux
    echo -e "${YELLOW}⚠️  tmux not found. Starting services in background...${NC}\n"
    
    for service_info in "${SERVICES[@]}"; do
      IFS=':' read -r service_name port <<< "$service_info"
      start_service "$service_name" "$port"
    done
    
    echo -e "\n${GREEN}✓ All services started in background${NC}"
    echo -e "${YELLOW}Check logs in: $ROOT_DIR/logs/${NC}"
    echo -e "${YELLOW}Stop services with: ${BLUE}kill \$(cat $ROOT_DIR/.pids/*.pid)${NC}\n"
  fi
}

# Run main function
main
