import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  return brevo.transactionalEmails.sendTransacEmail({
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.htmlContent,
    sender: {
      name: options.fromName ?? process.env.BREVO_SENDER_NAME ?? "ReachX",
      email: options.fromEmail ?? process.env.BREVO_SENDER_EMAIL!,
    },
  });
}
