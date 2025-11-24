# Operations Guide

## Monitoring

### Key Metrics
- Send rate (emails/sec)
- Queue length (pending jobs)
- Bounce rate (%)
- Error rate (%)
- Open rate (%)
- Click rate (%)

### Alerts
- Bounce rate > 5%
- Queue length > 10,000
- Error rate > 10%
- DKIM/SPF invalid

### Logs
Structured JSON logs in `app.log`:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "logger": "dispatcher",
  "message": "Email sent successfully"
}
```

## Maintenance

### Database
- Run migrations: `alembic upgrade head`
- Backup daily: `python scripts/db_backup.py backup`
- Vacuum: `VACUUM ANALYZE;`
- Monitor size: `SELECT pg_size_pretty(pg_database_size('email_marketing'));`

### Redis
- Monitor memory: `redis-cli INFO memory`
- Clear old keys: `redis-cli FLUSHDB`
- Persistence: Enable AOF for durability

### SMTP
- Test connection: `telnet smtp.example.com 587`
- Check DKIM: `python scripts/check_dkim.py example.com`
- Monitor queue: `mailq` (if using Postfix)

## Troubleshooting

### High Bounce Rate
1. Check DKIM/SPF records
2. Review bounce logs
3. Verify sender reputation
4. Check list quality

### Queue Backlog
1. Increase worker count
2. Reduce send rate limit
3. Check SMTP connection
4. Monitor database performance

### Failed Sends
1. Check SMTP credentials
2. Verify network connectivity
3. Review error logs
4. Check rate limits

## Retention Policies

- Events: 90 days (configurable)
- Send logs: 365 days (configurable)
- Audit logs: 1 year
- Suppression: Permanent

## Compliance

### GDPR
- Right to be forgotten: `POST /data/erase?email=user@example.com`
- Data export: `GET /subscribers/:id/export`
- Consent tracking: Stored with opt-in timestamp

### CAN-SPAM
- Unsubscribe link in every email
- Physical address in footer
- Opt-out honored within 10 days

### CASL (Canada)
- Express consent required
- Unsubscribe mechanism
- Sender identification
