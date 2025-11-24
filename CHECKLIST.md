# Installation & Setup Checklist

## ✅ Pre-Installation

- [ ] System meets requirements (see SETUP.md)
- [ ] Internet connection available
- [ ] Sufficient disk space (10GB+)
- [ ] Administrator access (for Docker installation)

## ✅ Installation Steps

### Docker Installation

- [ ] Docker Desktop downloaded
- [ ] Docker Desktop installed
- [ ] Docker verified: `docker --version`
- [ ] Docker Compose verified: `docker-compose --version`

### Project Setup

- [ ] Repository cloned or downloaded
- [ ] Project folder opened in terminal
- [ ] `.env.example` copied to `.env`
- [ ] `.env` configured (optional - defaults work)

### Service Startup

- [ ] `docker-compose up` executed (or `start.bat`/`start.sh`)
- [ ] Services starting (wait 2-3 minutes)
- [ ] All services showing "Up" status
- [ ] No error messages in logs

## ✅ Verification

### Services Running

- [ ] `docker-compose ps` shows all services Up
- [ ] Frontend loads at http://localhost:3000
- [ ] API responds at http://localhost:8000/health
- [ ] MailHog accessible at http://localhost:8025
- [ ] API docs at http://localhost:8000/docs

### Database

- [ ] Database connection successful
- [ ] Tables created
- [ ] Admin user created
- [ ] Can query subscribers table

### Authentication

- [ ] Can access login page
- [ ] Can login with admin@example.com / password123
- [ ] Dashboard loads after login
- [ ] Can navigate to all pages

## ✅ First Use

### Create Template

- [ ] Navigate to Templates
- [ ] Click "New Template"
- [ ] Enter template name
- [ ] Enter subject line
- [ ] Enter HTML content
- [ ] Save template
- [ ] Template appears in list

### Import Subscribers

- [ ] Navigate to Subscribers
- [ ] Click "Import CSV"
- [ ] Prepare CSV file (email, name columns)
- [ ] Upload CSV file
- [ ] Review import report
- [ ] Confirm import
- [ ] Subscribers appear in list

### Create Campaign

- [ ] Navigate to Campaigns
- [ ] Click "New Campaign"
- [ ] Enter campaign name
- [ ] Select template
- [ ] Configure send rate
- [ ] Save campaign
- [ ] Campaign appears in list

### Send Test Email

- [ ] Select campaign
- [ ] Click "Send Test"
- [ ] Enter test email
- [ ] Send test
- [ ] Check MailHog for email
- [ ] Verify email content

### Check Analytics

- [ ] Navigate to Dashboard
- [ ] View campaign metrics
- [ ] Check open/click rates
- [ ] View recent campaigns

## ✅ Configuration

### SMTP Setup (Optional)

- [ ] SMTP server details obtained
- [ ] Update `.env` with SMTP settings
- [ ] Test SMTP connection
- [ ] Send test email via SMTP

### DKIM Setup (Optional)

- [ ] DKIM keys generated
- [ ] DNS records updated
- [ ] DKIM validation passed
- [ ] SPF record configured
- [ ] DMARC policy set

### Email Settings

- [ ] From email configured
- [ ] Reply-to email set
- [ ] Unsubscribe link configured
- [ ] Footer text configured

## ✅ Troubleshooting

### If Services Won't Start

- [ ] Check Docker is running
- [ ] Check ports not in use
- [ ] Check disk space available
- [ ] Review error logs
- [ ] Try `docker-compose down` then `up`

### If Can't Login

- [ ] Check admin user created
- [ ] Verify email/password correct
- [ ] Check database connection
- [ ] Try recreating admin user

### If Emails Not Sending

- [ ] Check SMTP configuration
- [ ] Verify SMTP credentials
- [ ] Check network connectivity
- [ ] Review worker logs
- [ ] Check queue length

### If Database Issues

- [ ] Check PostgreSQL running
- [ ] Verify database exists
- [ ] Check connection string
- [ ] Try database reset

## ✅ Security

- [ ] Change default admin password
- [ ] Configure HTTPS (production)
- [ ] Set strong SECRET_KEY
- [ ] Enable DKIM signing
- [ ] Configure SPF/DMARC
- [ ] Set up backups
- [ ] Review audit logs

## ✅ Monitoring

- [ ] Set up log monitoring
- [ ] Configure alerts
- [ ] Monitor queue length
- [ ] Track bounce rate
- [ ] Monitor error rate
- [ ] Check database size

## ✅ Backup & Recovery

- [ ] Database backup configured
- [ ] Backup schedule set
- [ ] Test backup restore
- [ ] Document recovery procedure
- [ ] Store backups securely

## ✅ Documentation

- [ ] Read README.md
- [ ] Read SETUP.md
- [ ] Read QUICKSTART.md
- [ ] Read API.md
- [ ] Bookmark documentation
- [ ] Share with team

## ✅ Production Readiness

- [ ] Use managed database
- [ ] Use managed Redis
- [ ] Configure production SMTP
- [ ] Set up SSL/TLS
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Document procedures
- [ ] Train team
- [ ] Plan maintenance window

## ✅ Team Setup

- [ ] Create team accounts
- [ ] Assign roles
- [ ] Configure permissions
- [ ] Set up audit logging
- [ ] Document workflows
- [ ] Train on system
- [ ] Create runbooks

## ✅ Testing

- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Test email sending
- [ ] Test tracking
- [ ] Test analytics
- [ ] Test workflows
- [ ] Load test system

## ✅ Deployment

- [ ] Choose hosting provider
- [ ] Configure infrastructure
- [ ] Set up CI/CD
- [ ] Configure monitoring
- [ ] Set up alerts
- [ ] Plan rollback
- [ ] Document deployment
- [ ] Test deployment
- [ ] Deploy to production

## 📋 Post-Installation

### Daily Tasks
- [ ] Check dashboard
- [ ] Monitor queue
- [ ] Review bounce rate
- [ ] Check error logs

### Weekly Tasks
- [ ] Review analytics
- [ ] Check system health
- [ ] Review audit logs
- [ ] Backup database

### Monthly Tasks
- [ ] Review performance
- [ ] Update dependencies
- [ ] Security audit
- [ ] Capacity planning

### Quarterly Tasks
- [ ] Major updates
- [ ] Security review
- [ ] Disaster recovery test
- [ ] Performance optimization

## 🎯 Success Criteria

- [ ] All services running
- [ ] Can login successfully
- [ ] Can create templates
- [ ] Can import subscribers
- [ ] Can create campaigns
- [ ] Can send emails
- [ ] Can view analytics
- [ ] No error messages
- [ ] System responsive
- [ ] Documentation complete

## 📞 Support Resources

- [ ] README.md - Overview
- [ ] SETUP.md - Installation
- [ ] QUICKSTART.md - Common tasks
- [ ] API.md - API reference
- [ ] COMMANDS.md - Command reference
- [ ] OPERATIONS.md - Monitoring
- [ ] SECURITY.md - Security guide
- [ ] DEPLOYMENT.md - Production setup

## ✨ You're Ready!

Once all items are checked, your email marketing system is ready to use.

**Next Steps:**
1. Create your first template
2. Import your subscriber list
3. Create and send a campaign
4. Monitor results in analytics
5. Explore advanced features

**Questions?** Check the documentation or review logs for errors.

---

**Last Updated:** 2024
**Version:** 1.0.0
