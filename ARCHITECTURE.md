# System Architecture

## Overview
Self-hosted email marketing platform with subscriber management, campaign scheduling, template rendering, and analytics.

## Components

### Backend (FastAPI)
- REST API for all operations
- JWT authentication with role-based access
- Database models for subscribers, campaigns, templates, events
- Async SMTP dispatcher with DKIM signing
- Tracking pixel and click redirect handlers

### Workers (Celery)
- Background job processing
- Email sending with rate limiting
- Bounce processing
- Metrics aggregation
- Workflow execution

### Scheduler (APScheduler)
- Campaign scheduling
- Workflow timers
- Metrics computation
- Retention cleanup

### Frontend (React + TypeScript)
- Dashboard with KPIs
- Subscriber management with CSV import
- Template editor
- Campaign builder
- Automation flow editor
- Analytics and reporting

### Database (PostgreSQL)
- Subscribers with custom fields
- Templates with versioning
- Campaigns with A/B config
- Send logs with retry tracking
- Events (opens, clicks, unsubs, bounces)
- Workflow instances
- Suppression lists
- Audit logs

### Cache & Queue (Redis)
- Celery broker for job queue
- Result backend for task status
- Session storage

## Data Flow

### Campaign Send Flow
1. User creates campaign in frontend
2. API stores campaign in DB
3. Scheduler detects scheduled campaign
4. Creates send batch jobs in queue
5. Workers pick jobs and send emails
6. Tracking pixels injected in HTML
7. SMTP dispatcher sends via configured server
8. Send logs updated with status

### Tracking Flow
1. Recipient opens email
2. Browser requests tracking pixel
3. Handler verifies token and records event
4. Analytics aggregator computes metrics
5. Frontend displays updated stats

### Workflow Flow
1. Trigger event (signup, import)
2. Workflow engine creates instance
3. Evaluates conditions and routes
4. Schedules send/wait nodes
5. Workers execute send nodes
6. Conditions evaluated on events

## Security

- JWT tokens with expiration
- HMAC-signed tracking tokens
- DKIM email signing
- Role-based access control
- Audit logging
- Suppression list enforcement
- Double opt-in support

## Scalability

- Horizontal worker scaling
- Connection pooling
- Batch processing
- Rate limiting
- Queue-based architecture
- Stateless API servers
