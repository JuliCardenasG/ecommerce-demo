#!/bin/bash

# Development script for easy service management

case "$1" in
  "start")
    echo "Starting all services in development mode with hot reload..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ;;
  "invoice")
    echo "Starting invoice service locally with hot reload..."
    pnpm run start:invoice:hot
    ;;
  "order")
    echo "Starting order service locally with hot reload..."
    pnpm run start:order:hot
    ;;
  "stop")
    echo "Stopping all services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    ;;
  "logs")
    if [ -z "$2" ]; then
      echo "Showing logs for all services..."
      docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    else
      echo "Showing logs for $2..."
      docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f $2
    fi
    ;;
  *)
    echo "Usage: $0 {start|invoice|order|stop|logs [service-name]}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services with hot reload in Docker"
    echo "  invoice  - Start invoice service locally with hot reload"
    echo "  order    - Start order service locally with hot reload"
    echo "  stop     - Stop all Docker services"
    echo "  logs     - Show logs (optionally for specific service)"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start"
    echo "  ./dev.sh invoice"
    echo "  ./dev.sh logs invoice-service"
    exit 1
    ;;
esac
