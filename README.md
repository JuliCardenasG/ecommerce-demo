# Ecommerce Microservices Demo

This is a microservices-based ecommerce system built for demonstration purposes. It showcases how to create a scalable and maintainable architecture using NestJS, Docker, Kafka, and MongoDB.

## Project structure

The project consists of 3 main services:

- **API Gateway** (Port 3000) - Main entry point that routes requests to other services
- **Order Service** (Port 3001) - Handles order creation and management
- **Invoice Service** (Port 3002) - Manages invoice generation and file uploads

## Technology stack

- **NestJS**: Node.js framework for building the microservices
- **Docker**: Containerization for easy deployment
- **Kafka**: Message broker for communication between services
- **MongoDB**: Database for storing orders and invoices
- **TypeScript**: Programming language
- **pnpm**: Package manager

## Overview of the system

1. The API Gateway receives HTTP requests
2. It forwards requests to the appropriate service (Order or Invoice)
3. Services communicate with each other using Kafka messages
4. All data is stored in MongoDB
5. Invoice files are stored on the filesystem

## Quick start with Docker

The easiest way to run the entire system:

```bash
# Start all services with Docker Compose
docker compose up --build

# Stop all services
docker compose down
```

This will start:
- MongoDB database
- Kafka message broker
- All 3 microservices
- Zookeeper (required for Kafka)

## Development setup

```bash
./dev.sh start
```


## Testing

### Run Tests
```bash
# Unit tests
pnpm run test:unit

# End-to-end tests
pnpm run test:e2e

# Linting
pnpm run lint
```

### Test API Endpoints with Bruno

The project includes Bruno HTTP client files in the `/bruno` folder for testing the APIs:

1. Install [Bruno](https://www.usebruno.com/)
2. Open the `bruno` folder in Bruno
3. Use the provided requests to test the API endpoints

## Build for Production

```bash
# Build all services
docker compose up --build
```

## Environment Variables

Copy the .env.example file to .env and update the values as needed

## API Endpoints

### Via API Gateway (Port 3000)
- `POST /orders` - Create a new order
- `GET /orders` - List all orders
- `GET /orders/:id` - Get specific order
- `PUT /orders/:id/status` - Update order status
- `POST /invoices/upload` - Upload invoice file
- `GET /invoices/:orderId` - Get invoice by order ID

### Health Checks
- `GET /health` - Available on all services (ports 3000, 3001, 3002)

## CI/CD

The project includes GitHub Actions for:
- Code linting
- Unit and E2E testing
- Building applications

The CI runs automatically on pushes to `main` and `develop` branches.

## Project Architecture

```
API Gateway (3000)
    ↓
├── Order Service (3001) ←→ Kafka ←→ Invoice Service (3002)
    ↓                                        ↓
MongoDB (27017)                         MongoDB (27017)
```

This setup demonstrates microservices patterns, event-driven architecture, and containerized deployment suitable for production environments.
