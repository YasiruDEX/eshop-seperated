#!/bin/bash

# Simple version of start-services.sh (without tmux)
# This version starts all services in the background

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Services to start
SERVICES=(
  "api-gateway:8080"
  "auth-service:6001"
  "catalogue-service:6002"
  "payment-service:6004"
  "checkout-service:6008"
  "order-service:6009"
  "inventory-service:6010"
  "customer-service:6006"
)

print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}       🚀 ESHOP MICROSERVICES STARTUP 🚀${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

kill_port() {
  port=$1
  if lsof -Pi :$port >/dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

main() {
  print_header
  
  mkdir -p "$ROOT_DIR/logs"
  
  echo -e "${BLUE}Starting all services...${NC}\n"
  
  for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    service_path="$ROOT_DIR/$service_name"
    
    if [ ! -d "$service_path" ]; then
      echo -e "${RED}✗ $service_name not found${NC}"
      continue
    fi
    
    echo -e "${YELLOW}→ Starting $service_name (port $port)...${NC}"
    
    # Kill existing process on this port
    kill_port $port
    
    # Start service
    cd "$service_path"
    nohup npm run dev > "$ROOT_DIR/logs/${service_name}.log" 2>&1 &
    PID=$!
    cd "$ROOT_DIR"
    
    echo -e "${GREEN}✓ $service_name started (PID: $PID)${NC}"
    sleep 1
  done
  
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✓ All services started!${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
  
  echo -e "${YELLOW}📋 Service Status:${NC}"
  for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    if lsof -Pi :$port >/dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} $service_name (port $port)"
    else
      echo -e "  ${RED}✗${NC} $service_name (port $port) - NOT RUNNING"
    fi
  done
  
  echo -e "\n${YELLOW}📊 Logs available in: $ROOT_DIR/logs/${NC}"
  echo -e "${YELLOW}To view logs: ${BLUE}tail -f $ROOT_DIR/logs/[service-name].log${NC}"
  echo -e "${YELLOW}To stop all services: ${BLUE}./stop-services.sh${NC}\n"
}

main
