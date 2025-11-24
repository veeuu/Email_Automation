# Testing Guide

## Unit Tests

### Template Rendering
```bash
pytest tests/test_templates.py -v
```

Tests:
- Variable substitution
- Conditional rendering
- Safe filter application

### Tracking Tokens
```bash
pytest tests/test_tracking.py -v
```

Tests:
- Token creation and verification
- Invalid token rejection
- Tamper detection

### Suppression List
```bash
pytest tests/test_suppression.py -v
```

Tests:
- Add/remove suppression
- Bulk operations
- Lookup performance

## Integration Tests

### API Endpoints
```bash
pytest tests/test_api.py -v
```

Tests:
- Authentication flow
- CRUD operations
- Error handling

### Campaign Flow
```bash
pytest tests/test_campaigns.py -v
```

Tests:
- Campaign creation
- Scheduling
- Send log generation

## End-to-End Tests

### CSV Import → Campaign Send
1. Upload CSV with 10 test emails
2. Create campaign with test template
3. Send immediately
4. Verify emails in MailHog
5. Check send logs in database
6. Verify metrics computed

### Tracking Flow
1. Send test email
2. Click tracking pixel URL
3. Verify event recorded
4. Check metrics updated

### Workflow Flow
1. Create workflow with condition
2. Trigger with subscriber
3. Verify node execution
4. Check state persistence

## Load Testing

### Simulate Large Send
```bash
# Send 10,000 emails
for i in {1..10000}; do
  curl -X POST http://localhost:8000/subscribers/bulk_import \
    -F "file=@test_$i.csv"
done
```

### Monitor Performance
```bash
# Check queue length
docker exec redis redis-cli LLEN celery

# Check worker status
docker logs worker

# Check database connections
docker exec postgres psql -U user -d email_marketing -c "SELECT count(*) FROM pg_stat_activity;"
```

## Test Data

### Sample CSV
```csv
email,name,company
john@example.com,John Doe,Acme
jane@example.com,Jane Smith,Tech Corp
```

### Sample Template
```html
<h1>Hello {{ name }}!</h1>
<p>Welcome to {{ custom_fields.company }}</p>
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/
```

## Performance Benchmarks

### Target Metrics
- Send rate: 100+ emails/sec
- API response: < 200ms
- Queue processing: < 1s per email
- Database query: < 100ms

### Profiling
```bash
# Profile send_batch task
python -m cProfile -s cumulative backend/workers/worker.py
```

## Debugging

### Enable Debug Logging
```python
# In config.py
logging.basicConfig(level=logging.DEBUG)
```

### Database Queries
```python
# In app.py
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    print(statement)
```

### Worker Tasks
```bash
# Monitor task execution
celery -A workers.worker events
```
