import nodemailer from 'nodemailer';
import { injectTracking, generateUnsubscribeLink } from '../utils/emailTracker.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use STARTTLS for port 587
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendTestEmail(toEmail, template) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@emailmarketing.com',
      to: toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text_content
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      status: 'sent',
      provider_msg_id: info.messageId,
      error: null
    };
  } catch (err) {
    console.error('Failed to send email:', err);
    return {
      status: 'failed',
      provider_msg_id: null,
      error: err.message
    };
  }
}

export async function sendEmail(toEmail, subject, html, text, campaignId, subscriberId) {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    
    // Inject tracking into HTML
    let trackedHtml = html;
    if (subscriberId && campaignId) {
      trackedHtml = injectTracking(html, subscriberId, campaignId, baseUrl);
      
      // Add unsubscribe link if subscriber ID provided
      const unsubscribeLink = generateUnsubscribeLink(subscriberId, campaignId, baseUrl);
      trackedHtml += `<p style="font-size:12px;color:#999;"><a href="${unsubscribeLink}">Unsubscribe</a></p>`;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@emailmarketing.com',
      to: toEmail,
      subject,
      html: trackedHtml,
      text
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      status: 'sent',
      provider_msg_id: info.messageId,
      error: null
    };
  } catch (err) {
    console.error('Failed to send email:', err);
    return {
      status: 'failed',
      provider_msg_id: null,
      error: err.message
    };
  }
}
