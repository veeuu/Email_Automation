# Email Automation & Sending Guide

## Overview
This guide walks you through the complete process of setting up and sending emails using the Email Marketing Automation platform.

## Step 1: Configure SMTP Settings

Before sending any emails, configure your SMTP server:

1. Go to **Settings** page
2. Fill in SMTP Configuration:
   - **SMTP Host**: Your mail server (e.g., `smtp.gmail.com`)
   - **SMTP Port**: Usually 587 (TLS) or 465 (SSL)
   - **SMTP User**: Your email address
   - **SMTP Password**: Your email password or app-specific password
3. (Optional) Configure DKIM for email authentication
4. Click **Save Settings**

### Example: Gmail Setup
- Host: `smtp.gmail.com`
- Port: `587`
- User: `your-email@gmail.com`
- Password: Generate an [App Password](https://myaccount.google.com/apppasswords)

---

## Step 2: Create Email Templates

Templates define the content of your emails:

1. Go to **Templates** page
2. Click **New Template**
3. Fill in:
   - **Template Name**: e.g., "Welcome Email"
   - **Subject**: e.g., "Welcome to {{company_name}}!"
   - **HTML Content**: Your email design (supports variables like `{{first_name}}`, `{{email}}`)
4. Click **Create**

### Template Variables
You can use subscriber data in templates:
- `{{first_name}}` - Subscriber's first name
- `{{email}}` - Subscriber's email
- `{{name}}` - Full name
- `{{custom_field_name}}` - Any custom field

---

## Step 3: Add Subscribers

Add email addresses to your subscriber list:

### Option A: Manual Import
1. Go to **Subscribers** page
2. Click **Import CSV**
3. Upload a CSV file with columns: `email`, `name`, `status`
4. Click **Import**

### CSV Format Example
```
email,name,status
john@example.com,John Doe,active
jane@example.com,Jane Smith,active
bob@example.com,Bob Johnson,active
```

### Option B: API
```bash
POST /subscribers/bulk_import
Content-Type: multipart/form-data

file: <your-csv-file>
```

---

## Step 4: Create a Campaign

Campaigns define who gets what email:

1. Go to **Campaigns** page
2. Click **New Campaign**
3. Fill in:
   - **Campaign Name**: e.g., "Black Friday Sale"
   - **Template**: Select the template to send
   - **Send Rate**: Emails per second (e.g., 10)
4. Click **Create**

The campaign is now in **Draft** status.

---

## Step 5: Send Test Email

Before sending to all subscribers, test with your own email:

1. Go to **Campaigns** page
2. Find your campaign
3. Click **Send Test** (or use API)
4. Enter your test email address
5. Check your inbox

### API
```bash
POST /campaigns/{campaign_id}/send_test
Content-Type: application/json

{
  "test_email": "your-email@example.com"
}
```

---

## Step 6: Start the Campaign

Once you're satisfied with the test:

1. Go to **Campaigns** page
2. Find your campaign
3. Click **Start** to begin sending

The campaign status changes to **Sending** and emails are queued.

### API
```bash
POST /campaigns/{campaign_id}/start
```

---

## Campaign Management

### Pause a Campaign
Stop sending temporarily (can resume later):
```bash
POST /campaigns/{campaign_id}/pause
```

### Cancel a Campaign
Stop and mark as cancelled (cannot resume):
```bash
POST /campaigns/{campaign_id}/cancel
```

### Schedule a Campaign
Send at a specific time:
```bash
POST /campaigns/{campaign_id}/schedule
Content-Type: application/json

{
  "schedule_at": "2024-12-01T10:00:00Z"
}
```

---

## Automation Workflows

Set up automated email sequences:

1. Go to **Automation** page
2. Click **New Workflow**
3. Define:
   - **Workflow Name**: e.g., "Welcome Series"
   - **Trigger**: When to start (subscribe, click, unsubscribe)
   - **Actions**: What emails to send and when
4. Click **Create**

### Trigger Types
- **subscribe**: When someone joins your list
- **click**: When someone clicks a link in an email
- **unsubscribe**: When someone unsubscribes

---

## Analytics & Monitoring

Track campaign performance:

1. Go to **Analytics** page
2. View metrics:
   - **Total Sent**: Number of emails sent
   - **Total Opened**: Number of opens
   - **Total Clicked**: Number of link clicks
   - **Unsubscribed**: Number of unsubscribes

---

## API Reference

### Create Campaign
```bash
POST /campaigns
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Campaign Name",
  "template_id": "uuid",
  "send_rate": 10,
  "schedule_at": "2024-12-01T10:00:00Z"
}
```

### List Campaigns
```bash
GET /campaigns
Authorization: Bearer {token}
```

### Create Template
```bash
POST /templates
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Template Name",
  "subject": "Email Subject",
  "html": "<html>...</html>",
  "text_content": "Plain text version"
}
```

### List Templates
```bash
GET /templates
Authorization: Bearer {token}
```

### Import Subscribers
```bash
POST /subscribers/bulk_import
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: <csv-file>
```

### List Subscribers
```bash
GET /subscribers?page=1&page_size=50
Authorization: Bearer {token}
```

---

## Troubleshooting

### Emails not sending?
1. Check SMTP settings in Settings page
2. Verify test email works
3. Check that subscribers have `status: active`
4. Ensure template exists and is valid

### Campaign stuck in "Sending"?
1. Check backend logs
2. Verify SMTP connection
3. Try pausing and restarting

### Subscribers not imported?
1. Check CSV format (must have `email` column)
2. Verify file encoding is UTF-8
3. Check for duplicate emails

---

## Best Practices

1. **Always test first** - Send a test email before full campaign
2. **Monitor sending** - Check Analytics page during sending
3. **Respect rate limits** - Don't set send_rate too high
4. **Use templates** - Reuse templates for consistency
5. **Segment subscribers** - Use tags and custom fields
6. **Track metrics** - Monitor opens, clicks, unsubscribes

---

## Next Steps

- Set up SMTP credentials
- Create your first template
- Import subscribers
- Send a test campaign
- Monitor analytics
