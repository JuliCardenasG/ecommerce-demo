# Hot Reload Development Setup

This project is now configured with Nest.js webpack HMR (Hot Module Replacement) for efficient development with instant code reloading.

## Architecture Overview

The project uses **pure NestJS microservices pattern** with Kafka for event communication:

- **Order Service**: Handles order management and publishes order events
- **Invoice Service**: Handles invoice processing and responds to order events  
- **Kafka Integration**: Uses NestJS built-in microservice patterns with `@MessagePattern` decorators
- **Consumer Groups**: Each service uses independent consumer groups for proper event delivery

### Event Flow
```
Order Service -> Kafka (ORDER_CREATED) -> Order Service handlers
Order Service -> Kafka (INVOICE_SEND) -> Invoice Service handlers  
Invoice Service -> Kafka (INVOICE_UPLOADED, INVOICE_SENT) -> Order Service handlers
```

## Development Commands

### Local Development (Recommended for active development)

```bash
# Start invoice service with hot reload
pnpm run start:invoice:hot

# Start order service with hot reload  
pnpm run start:order:hot

# Or use the development script
./dev.sh invoice   # Start invoice service locally
./dev.sh order     # Start order service locally
```

### Docker Development

```bash
# Start all services with hot reload in Docker
./dev.sh start

# Stop all services
./dev.sh stop

# View logs
./dev.sh logs
./dev.sh logs invoice-service
```

### Traditional Watch Mode (fallback)

```bash
# Standard watch mode (without HMR)
pnpm run start:invoice:dev
pnpm run start:order:dev
```

## How Hot Reload Works

1. **Webpack HMR**: Uses webpack's Hot Module Replacement instead of process restart
2. **File Watching**: Monitors TypeScript files for changes
3. **Instant Compilation**: Recompiles only changed modules
4. **State Preservation**: Maintains microservice connections and application state
5. **Kafka Consumer Groups**: Each service uses independent consumer groups (`order-service-group`, `invoice-service-group`) ensuring both services receive events

## Microservice Event Patterns

### Message Patterns
Services use `@MessagePattern()` decorators to handle specific events:

```typescript
@MessagePattern('INVOICE_SEND')
async handleInvoiceSend(@Payload() data: InvoiceSendPayload) {
  await this.invoiceService.sendInvoice(data.invoiceId, data.orderId);
}
```

### Event Publishing
Services use `ClientProxy.emit()` for publishing events:

```typescript
this.kafkaClient.emit(OrderInvoiceEvents.ORDER_CREATED, payload);
```

### Consumer Groups
- **Order Service**: `order-service-group` 
- **Invoice Service**: `invoice-service-group`

This ensures both services receive the same events independently.

## Development Workflow

1. Make code changes in any service
2. Save the file
3. See changes instantly reflected (usually under 1 second)
4. No manual restart needed
5. Kafka connections and other microservice connections are preserved

## Configuration Files

- `webpack-hmr.config.js` - Webpack hot reload configuration
- `docker-compose.dev.yml` - Docker override for development
- `Dockerfile.dev` - Development Dockerfiles with hot reload support

## Troubleshooting

If hot reload isn't working:

1. Check that the service is using the correct command (`start:*:hot`)
2. Ensure webpack packages are installed: `webpack`, `webpack-node-externals`, `run-script-webpack-plugin`
3. Verify the `webpack-hmr.config.js` file exists in project root
4. For Docker: ensure volumes are properly mounted

## Performance

Hot reload is significantly faster than traditional restart methods:
- **Traditional restart**: 3-5 seconds
- **Hot reload**: < 1 second
- **No connection drops**: Microservice connections remain active
