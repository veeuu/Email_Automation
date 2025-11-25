import db from '../db/database.js';
import { sendEmail } from '../services/emailService.js';

async function sendCampaignEmails() {
  return new Promise((resolve) => {
    db.all(
      `SELECT * FROM campaigns WHERE status = 'sending'`,
      async (err, campaigns) => {
        if (err || !campaigns) {
          console.log('No campaigns to send');
          resolve();
          return;
        }

        for (const campaign of campaigns) {
          console.log(`Processing campaign: ${campaign.name}`);

          db.get(
            'SELECT * FROM templates WHERE id = ?',
            [campaign.template_id],
            async (err, template) => {
              if (err || !template) {
                console.error(`Template not found for campaign ${campaign.id}`);
                return;
              }

              db.all(
                `SELECT sl.*, s.email, s.name FROM send_logs sl
                 JOIN subscribers s ON sl.subscriber_id = s.id
                 WHERE sl.campaign_id = ? AND sl.status = 'pending'
                 LIMIT ?`,
                [campaign.id, campaign.send_rate],
                async (err, sendLogs) => {
                  if (err || !sendLogs) {
                    console.log(`No pending emails for campaign ${campaign.name}`);
                    return;
                  }

                  console.log(`Sending ${sendLogs.length} emails for campaign ${campaign.name}`);

                  for (const log of sendLogs) {
                    try {
                      const subject = template.subject.replace(/{{name}}/g, log.name || 'User');
                      const html = template.html.replace(/{{name}}/g, log.name || 'User');
                      const text = template.text_content?.replace(/{{name}}/g, log.name || 'User');

                      const result = await sendEmail(log.email, subject, html, text);

                      const now = new Date().toISOString();
                      if (result.status === 'sent') {
                        db.run(
                          `UPDATE send_logs SET status = 'sent', updated_at = ? WHERE id = ?`,
                          [now, log.id]
                        );
                        console.log(`✓ Email sent to ${log.email}`);
                      } else {
                        db.run(
                          `UPDATE send_logs SET status = 'failed', last_error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?`,
                          [result.error, now, log.id]
                        );
                        console.error(`✗ Failed to send to ${log.email}: ${result.error}`);
                      }

                      // Rate limiting
                      await new Promise(r => setTimeout(r, 1000 / campaign.send_rate));
                    } catch (err) {
                      console.error(`Error sending email: ${err.message}`);
                    }
                  }
                }
              );
            }
          );
        }

        resolve();
      }
    );
  });
}

// Run continuously
async function runContinuous() {
  console.log('Starting continuous email sending...');
  while (true) {
    await sendCampaignEmails();
    await new Promise(r => setTimeout(r, 5000)); // Check every 5 seconds
  }
}

// Check for --continuous flag
if (process.argv.includes('--continuous')) {
  runContinuous();
} else {
  sendCampaignEmails().then(() => {
    console.log('Done');
    process.exit(0);
  });
}
