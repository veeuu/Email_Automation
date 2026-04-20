import { readFileSync } from "fs";

// Read .env manually
const env = readFileSync(".env", "utf-8");
for (const line of env.split("\n")) {
  const [key, ...val] = line.split("=");
  if (key && val.length) process.env[key.trim()] = val.join("=").trim().replace(/^"|"$/g, "");
}

const { BrevoClient } = await import("@getbrevo/brevo");

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

console.log("API Key:", process.env.BREVO_API_KEY?.slice(0, 20) + "...");
console.log("Sender:", process.env.BREVO_SENDER_EMAIL);

try {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    to: [{ email: "veeekamble@gmail.com" }],
    subject: "ReachX Test Email",
    htmlContent: "<p>Hello! This is a test from ReachX.</p>",
    sender: {
      name: process.env.BREVO_SENDER_NAME ?? "ReachX",
      email: process.env.BREVO_SENDER_EMAIL,
    },
  });
  console.log("Success:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("Error:", err?.message ?? err);
  if (err?.body) console.error("Body:", JSON.stringify(err.body, null, 2));
}
