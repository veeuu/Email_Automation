import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_USE_TLS === 'true',
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

export async function sendEmail(toEmail, subject, html, text) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@emailmarketing.com',
      to: toEmail,
      subject,
      html,
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
