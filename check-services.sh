#!/bin/bash

# Check status of all services

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}       📊 ESHOP MICROSERVICES STATUS 📊${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

check_health() {
  local port=$1
  local service=$2
  
  # Try to connect to the service
  if timeout 2 bash -c "echo > /dev/tcp/localhost/$port" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $service (port $port) - ${GREEN}RUNNING${NC}"
    return 0
  else
    echo -e "${RED}✗${NC} $service (port $port) - ${RED}NOT RUNNING${NC}"
    return 1
  fi
}

main() {
  print_header
  
  # Services with ports
  declare -a SERVICES=(
    "API Gateway:8080"
    "Auth Service:6001"
    "Catalogue Service:6002"
    "Payment Service:6004"
    "Checkout Service:6008"
    "Order Service:6009"
    "Inventory Service:6010"
    "Customer Service:6006"
  )
  
  running=0
  total=0
  
  for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    if check_health "$port" "$service_name"; then
      ((running++))
    fi
    ((total++))
  done
  
  echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
  echo -e "Services Running: ${GREEN}$running${NC}/${total}"
  
  if [ $running -eq $total ]; then
    echo -e "${GREEN}✓ All services are running!${NC}"
  elif [ $running -eq 0 ]; then
    echo -e "${RED}✗ No services are running${NC}"
  else
    echo -e "${YELLOW}⚠ Some services are not running${NC}"
  fi
  
  echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

main
