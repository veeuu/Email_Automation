import { Worker } from "bullmq";
import { connection } from "../lib/queue";
import { sendEmail } from "../lib/brevo";
import { prisma } from "../lib/prisma";

export const emailWorker = new Worker(
  "email-send",
  async (job) => {
    const { recipientId, campaignId, to, subject, htmlContent } = job.data;

    await sendEmail({ to, subject, htmlContent });

    await prisma.emailEvent.create({
      data: {
        eventType: "SENT",
        campaignId,
        recipientId,
      },
    });
  },
  { connection, concurrency: 5 }
);

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
