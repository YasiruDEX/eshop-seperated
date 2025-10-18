#!/bin/bash

# Stop all services script

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}       🛑 ESHOP MICROSERVICES SHUTDOWN 🛑${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

main() {
  print_header
  
  # Ports to check
  PORTS=(8080 6001 6002 6004 6008 6009 6010 6006)
  
  echo -e "${BLUE}Stopping all services...${NC}\n"
  
  for port in "${PORTS[@]}"; do
    if lsof -Pi :$port >/dev/null 2>&1; then
      echo -e "${YELLOW}Killing process on port $port...${NC}"
      lsof -ti:$port | xargs kill -9 2>/dev/null || true
      echo -e "${GREEN}✓ Stopped process on port $port${NC}"
    fi
  done
  
  # Kill tmux session if it exists
  if tmux list-sessions 2>/dev/null | grep -q "eshop"; then
    echo -e "${YELLOW}Killing tmux session 'eshop'...${NC}"
    tmux kill-session -t eshop
    echo -e "${GREEN}✓ Killed tmux session${NC}"
  fi
  
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✓ All services stopped!${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

main
