# Domain Configuration Guide

## Overview
This setup uses nginx as a reverse proxy to route requests to your frontend and backend services based on domain names.

## Architecture
```
proplusdata.co → nginx → frontend (port 3000)
api.proplusdata.co → nginx → backend (port 8000)
```

## Prerequisites

1. **Domain DNS Records** - Point these to your server's IP address:
   - `proplusdata.co` → Your Server IP
   - `www.proplusdata.co` → Your Server IP
   - `api.proplusdata.co` → Your Server IP

2. **SSL Certificates** - You need SSL certificates for HTTPS:

### Option A: Let's Encrypt (Recommended - Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --standalone -d proplusdata.co -d www.proplusdata.co -d api.proplusdata.co

# Certificates will be at:
# /etc/letsencrypt/live/proplusdata.co/fullchain.pem
# /etc/letsencrypt/live/proplusdata.co/privkey.pem
```

### Option B: Self-Signed (Development Only)

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

## Setup Steps

1. **Create SSL directory and add certificates:**
   ```bash
   mkdir -p ssl
   # Copy your certificates to ssl/cert.pem and ssl/key.pem
   ```

2. **Update nginx.conf** - Already configured in the repo

3. **Update Docker Compose** - Already configured in the repo

4. **Build and run:**
   ```bash
   docker-compose up -d
   ```

5. **Verify:**
   - Frontend: https://proplusdata.co
   - API: https://api.proplusdata.co/health

## Environment Variables

### Backend (.env)
- `API_BASE_URL=https://api.proplusdata.co`
- `BASE_URL=https://proplusdata.co`

### Frontend (.env)
- `VITE_API_URL=https://api.proplusdata.co`

## Troubleshooting

### Nginx not starting
- Check SSL certificate paths exist
- Verify nginx.conf syntax: `docker exec <nginx-container> nginx -t`

### CORS errors
- Ensure backend CORS origins include your domain
- Check browser console for specific error messages

### SSL certificate errors
- Verify certificate files are readable
- Check certificate expiration date
- Renew Let's Encrypt certificates before expiry

### Services not communicating
- Verify all services are on the same Docker network
- Check service names in nginx.conf match docker-compose service names
- View logs: `docker-compose logs <service-name>`

## Auto-Renewal (Let's Encrypt)

```bash
# Add to crontab for automatic renewal
0 0 1 * * certbot renew --quiet
```

## Production Checklist

- [ ] SSL certificates installed and valid
- [ ] DNS records pointing to server
- [ ] CORS origins configured correctly
- [ ] Environment variables set for production
- [ ] Firewall allows ports 80 and 443
- [ ] Database backups configured
- [ ] Logs monitored
- [ ] SSL certificate renewal automated
