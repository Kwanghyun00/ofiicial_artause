import { z } from 'zod';

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
});

const isEmailConfigured = Boolean(
  process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
);

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@artause.co.kr';

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

async function sendViaSMTP(to: string, subject: string, html: string): Promise<void> {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const parsed = emailSchema.safeParse({ to, subject, html });
  if (!parsed.success) {
    throw new Error(`sendEmail validation failed: ${parsed.error.message}`);
  }

  if (!isEmailConfigured) {
    console.info('[Email mock] to=%s subject=%s', to, subject);
    return;
  }

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html);
    return;
  }

  await sendViaSMTP(to, subject, html);
}
