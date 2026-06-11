// Minimal mail abstraction. In development (or when SMTP is not configured)
// emails are logged to the server console. Swap the transport for
// Resend/SES/Nodemailer by implementing MailProvider — call sites stay stable.

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface MailProvider {
  send(message: MailMessage): Promise<void>;
}

class ConsoleMailProvider implements MailProvider {
  async send(message: MailMessage): Promise<void> {
    console.log("\n=== [mail] (console transport) ===");
    console.log(`To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(message.text);
    console.log("===================================\n");
  }
}

function createProvider(): MailProvider {
  // SMTP transport is wired in a later phase; console transport keeps the
  // forgot-password flow fully functional in development.
  return new ConsoleMailProvider();
}

export const mailer: MailProvider = createProvider();

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await mailer.send({
    to,
    subject: "Reset your HACCP Pro password",
    text: [
      "You requested a password reset for your HACCP Pro account.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
  });
}
