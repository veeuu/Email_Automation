# Gmail Setup for Email Sending

Gmail blocks third-party applications from using your regular password for security reasons. You have two options:

## Option 1: Use Gmail App Password (RECOMMENDED)

This is the secure way to send emails through Gmail.

### Steps:

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the steps to enable it

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Select "Windows Computer" (or your device)
   - Click "Generate"
   - Google will show a 16-character password
   - Copy this password

3. **Update Configuration**:
   - Open `.env` file
   - Replace `SMTP_PASSWORD=kamblevidhishaa24` with your 16-character app password
   - Example: `SMTP_PASSWORD=abcd efgh ijkl mnop`

4. **Restart the backend**:
   ```bash
   # Stop the current backend process
   # Run: python backend/app.py
   ```

---

## Option 2: Enable Less Secure App Access (NOT RECOMMENDED)

This is less secure but simpler.

### Steps:

1. Go to https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure app access"
3. Your regular password should now work

**Warning**: This makes your account less secure. Use Option 1 instead.

---

## Testing

Once configured, run:
```bash
python send_via_api.py
```

You should see:
```
✓ EMAIL SENT SUCCESSFULLY!
From: kamblevidhishaa@gmail.com
To: veeekamble@gmail.com
```

---

## Troubleshooting

If you still get "Username and Password not accepted":

1. Check that you copied the app password correctly (no extra spaces)
2. Verify 2-Factor Authentication is enabled
3. Try generating a new app password
4. Restart the backend after updating `.env`

---

## Using the Web UI

Once email sending is working:

1. Go to http://localhost:3000
2. Login with admin@example.com / password123
3. Go to **Settings** page
4. Enter your SMTP credentials
5. Go to **Templates** → Create a template
6. Go to **Subscribers** → Add veeekamble@gmail.com
7. Go to **Campaigns** → Create campaign → Start sending
