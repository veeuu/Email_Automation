# Security & Compliance

## Authentication & Authorization

### JWT Tokens
- 30-minute expiration (configurable)
- Refresh token support (implement as needed)
- Stored in localStorage (frontend)
- Sent in Authorization header

### Role-Based Access Control
- Admin: Full access
- User: Campaign and subscriber management
- Viewer: Read-only access (implement as needed)

### Password Security
- Bcrypt hashing with salt
- Minimum 8 characters recommended
- No password reset via email (implement secure flow)

## Data Protection

### In Transit
- HTTPS/TLS for all connections
- SMTP with STARTTLS
- Signed tracking tokens (HMAC-SHA256)

### At Rest
- Database encryption (enable in production)
- Secrets in vault (not in code)
- Sensitive fields encrypted (implement as needed)

### Email Security
- DKIM signing (RSA-2048)
- SPF records
- DMARC policy
- BIMI support (optional)

## API Security

### Rate Limiting
- Implement per-user limits
- Implement per-IP limits
- Queue-based backpressure

### Input Validation
- Email validation (RFC 5322)
- Template sanitization (prevent XSS)
- SQL injection prevention (SQLAlchemy ORM)

### CORS
- Restrict to frontend domain in production
- Disable credentials if not needed

## Audit & Compliance

### Audit Logging
- All user actions logged
- Campaign sends tracked
- Bounce events recorded
- Suppression changes logged

### Data Retention
- Events: 90 days
- Logs: 365 days
- Suppression: Permanent
- Audit: 1 year

### GDPR Compliance
- Right to access: `GET /subscribers/:id`
- Right to erasure: `POST /data/erase`
- Data portability: `GET /subscribers/export`
- Consent tracking: Stored with timestamp

### CAN-SPAM Compliance
- Unsubscribe link in every email
- Physical address in footer
- Opt-out honored within 10 days
- Accurate sender information

## Deployment Security

### Environment Variables
- Never commit secrets
- Use `.env` file (gitignored)
- Rotate keys regularly
- Use vault in production

### Database
- Strong passwords
- Network isolation
- Regular backups
- Encryption at rest

### Infrastructure
- Firewall rules
- VPC isolation
- DDoS protection
- WAF rules

## Incident Response

### Breach Notification
- Notify affected users within 72 hours
- Document incident
- Review logs
- Implement fixes

### Monitoring
- Failed login attempts
- Unusual send patterns
- High bounce rates
- Database errors
