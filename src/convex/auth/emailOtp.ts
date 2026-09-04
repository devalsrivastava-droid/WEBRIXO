import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

const APP_NAME = "WEBRIXO";

function otpEmailHtml(token: string) {
  return `<!doctype html><html><body style="margin:0;background:#000;font-family:'Bricolage Grotesque',system-ui,sans-serif;color:#f3f1ec">
  <div style="max-width:520px;margin:0 auto;padding:48px 28px">
    <div style="font-weight:600;letter-spacing:.04em;font-size:14px;margin-bottom:40px">WEBRIXO</div>
    <h1 style="font-size:28px;font-weight:500;letter-spacing:-.02em;margin:0 0 12px">Your sign-in code</h1>
    <p style="font-size:15px;line-height:1.6;color:#8b8983;margin:0 0 28px">Enter this code on the WEBRIXO sign-in page. It expires in 15 minutes.</p>
    <div style="font-size:40px;letter-spacing:.32em;font-weight:600;padding:22px 24px;border:1px solid rgba(243,241,236,.16);border-radius:14px;display:inline-block">${token}</div>
    <p style="font-size:13px;line-height:1.6;color:#8b8983;margin:32px 0 0">If you didn't try to sign in, you can ignore this email.</p>
  </div></body></html>`;
}

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = { read(bytes: Uint8Array) { crypto.getRandomValues(bytes); } };
    return generateRandomString(random, "0123456789", 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // Preferred: your own sender. Set RESEND_API_KEY (and optionally AUTH_EMAIL_FROM) in the Convex dashboard.
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.AUTH_EMAIL_FROM || "WEBRIXO <hello@webrixo.com>",
          to: email,
          subject: `${token} is your WEBRIXO sign-in code`,
          html: otpEmailHtml(token),
          text: `Your WEBRIXO sign-in code is ${token}. It expires in 15 minutes.`,
        }),
      });
      if (!res.ok) throw new Error(`Could not send the sign-in email (${res.status}).`);
      return;
    }
    // Development fallback: print the code to the Convex logs so the flow can be
    // tested before an email sender exists. Guarded by an explicit variable so
    // it can never switch itself on in production — a code in a log is a code
    // anyone with log access can use.
    if (process.env.AUTH_DEV_LOG_CODES === "true") {
      console.warn(`[dev] sign-in code for ${email}: ${token} — set RESEND_API_KEY to send real email.`);
      return;
    }

    throw new Error(
      "Email sign-in isn't set up yet. Set RESEND_API_KEY in the Convex dashboard to send real codes, " +
      "or set AUTH_DEV_LOG_CODES=true to print codes to the Convex logs while testing.",
    );
  },
});
