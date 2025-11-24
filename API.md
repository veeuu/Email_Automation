# API Reference

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "admin"
}
```

## Subscribers

### List Subscribers
```
GET /subscribers?page=1&page_size=50&status=active
Authorization: Bearer <token>

Response:
{
  "items": [...],
  "total": 1000,
  "page": 1,
  "page_size": 50
}
```

### Get Subscriber
```
GET /subscribers/{id}
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "status": "active",
  "tags": {},
  "custom_fields": {},
  "created_at": "2024-01-01T00:00:00Z",
  "last_activity": "2024-01-02T00:00:00Z",
  "events": [...]
}
```

### Bulk Import
```
POST /subscribers/bulk_import
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <CSV file>

Response:
{
  "import_id": "uuid",
  "total_rows": 100,
  "imported": 95,
  "skipped": 5,
  "errors": []
}
```

### Unsubscribe
```
POST /subscribers/{id}/unsubscribe
Authorization: Bearer <token>

Response:
{
  "status": "unsubscribed"
}
```

## Templates

### List Templates
```
GET /templates
Authorization: Bearer <token>

Response: [...]
```

### Create Template
```
POST /templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Welcome Email",
  "subject": "Welcome {{ name }}!",
  "html": "<h1>Hello {{ name }}</h1>",
  "text_content": "Hello {{ name }}"
}

Response:
{
  "id": "uuid",
  "name": "Welcome Email",
  "subject": "Welcome {{ name }}!",
  "html": "<h1>Hello {{ name }}</h1>",
  "text_content": "Hello {{ name }}",
  "version": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Preview Template
```
POST /templates/{id}/preview?subscriber_id={subscriber_id}
Authorization: Bearer <token>

Response:
{
  "subject": "Welcome John!",
  "html": "<h1>Hello John</h1>",
  "text": "Hello John"
}
```

## Campaigns

### Create Campaign
```
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Campaign",
  "template_id": "uuid",
  "segment_query": {},
  "send_rate": 10,
  "a_b_config": null
}

Response:
{
  "id": "uuid",
  "name": "Q1 Campaign",
  "template_id": "uuid",
  "status": "draft",
  "send_rate": 10,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Schedule Campaign
```
POST /campaigns/{id}/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "schedule_at": "2024-01-15T10:00:00Z"
}

Response:
{
  "status": "scheduled",
  "schedule_at": "2024-01-15T10:00:00Z"
}
```

### Send Test
```
POST /campaigns/{id}/send_test
Authorization: Bearer <token>
Content-Type: application/json

{
  "test_email": "test@example.com"
}

Response:
{
  "status": "sent"
}
```

### Start Campaign
```
POST /campaigns/{id}/start
Authorization: Bearer <token>

Response:
{
  "status": "sending"
}
```

### Pause Campaign
```
POST /campaigns/{id}/pause
Authorization: Bearer <token>

Response:
{
  "status": "paused"
}
```

## Analytics

### Get Campaign Metrics
```
GET /analytics/campaigns/{id}/metrics?from_date=2024-01-01&to_date=2024-01-31
Authorization: Bearer <token>

Response:
{
  "campaign_id": "uuid",
  "total_sent": 1000,
  "total_opened": 250,
  "total_clicked": 50,
  "total_unsubscribed": 5,
  "total_bounced": 10,
  "open_rate": 25.0,
  "click_rate": 5.0
}
```

### Get Link Performance
```
GET /analytics/campaigns/{id}/link-performance
Authorization: Bearer <token>

Response:
{
  "links": {
    "https://example.com/offer": 45,
    "https://example.com/blog": 5
  }
}
```

## Tracking

### Track Open
```
GET /track/open?token={token}

Response: 1x1 pixel image
```

### Track Click
```
GET /track/click?token={token}

Response: Redirect to original URL
```

### Unsubscribe
```
GET /unsubscribe?token={token}

Response:
{
  "status": "unsubscribed"
}
```

## Settings

### Update SMTP Settings
```
POST /settings/smtp
Authorization: Bearer <token>
Content-Type: application/json

{
  "host": "smtp.example.com",
  "port": 587,
  "user": "user@example.com",
  "password": "password",
  "use_tls": true,
  "from_email": "noreply@example.com"
}

Response:
{
  "status": "updated"
}
```

### Check DKIM
```
GET /settings/dkim/check?domain=example.com
Authorization: Bearer <token>

Response:
{
  "domain": "example.com",
  "dkim_valid": true,
  "spf_valid": true,
  "dmarc_valid": false
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
