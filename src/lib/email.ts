import "server-only";
import { BRAND } from "./brand";
import { getConfig } from "./config";

export interface EmailResult {
  sent: boolean;
  /** Development only (EMAIL_DEV_LINKS=1): the link that would have been emailed */
  devLink?: string;
  error?: string;
}

function layout(title: string, body: string, cta: { label: string; url: string }, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#14181d">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e3e7e5">
<tr><td style="font-size:18px;font-weight:700;color:#047857;padding-bottom:20px">${BRAND.name}</td></tr>
<tr><td style="font-size:20px;font-weight:600;padding-bottom:12px">${title}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#363d46;padding-bottom:24px">${body}</td></tr>
<tr><td style="padding-bottom:24px"><a href="${cta.url}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">${cta.label}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#66707c">${footer}<br><br>If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all;color:#047857">${cta.url}</span></td></tr>
</table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string, link: string): Promise<EmailResult> {
  const cfg = getConfig();
  if (cfg.EMAIL_DEV_LINKS) {
    console.info(`[email] (dev) to ${to}: ${subject}\n        ${link}`);
    return { sent: false, devLink: link };
  }
  if (!cfg.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY is not set — email not sent", { to, subject });
    return { sent: false, error: "Email is not configured on the server yet." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.EMAIL_FROM, to: [to], subject, html, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("[email] Resend error", res.status, detail.slice(0, 300));
      return { sent: false, error: "We couldn't send the email. Please try again in a minute." };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] send failed", e);
    return { sent: false, error: "We couldn't send the email. Please try again in a minute." };
  }
}

export function sendVerificationEmail(to: string, name: string, link: string) {
  const first = name.split(" ")[0];
  return send(
    to,
    `Confirm your email for ${BRAND.name}`,
    layout(
      `Welcome, ${first}!`,
      `Confirm your email address to activate your ${BRAND.name} account. You'll get your free starter credits right after.`,
      { label: "Confirm my email", url: link },
      "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    ),
    `Welcome to ${BRAND.name}! Confirm your email: ${link}\n\nThis link expires in 24 hours.`,
    link,
  );
}

export function sendPasswordResetEmail(to: string, link: string) {
  return send(
    to,
    `Reset your ${BRAND.name} password`,
    layout(
      "Reset your password",
      "We received a request to reset your password. Click below to choose a new one.",
      { label: "Choose a new password", url: link },
      "This link expires in 1 hour. If you didn't ask for this, you can ignore this email — your password stays the same.",
    ),
    `Reset your ${BRAND.name} password: ${link}\n\nThis link expires in 1 hour.`,
    link,
  );
}
