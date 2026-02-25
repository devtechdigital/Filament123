import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { randomInt } from "node:crypto";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      id: "email",
      maxAge: 60 * 10,
      from: process.env.AUTH_EMAIL_FROM ?? "Filament.home <noreply@filament.home>",
      generateVerificationToken: async () =>
        String(randomInt(0, 1_000_000)).padStart(6, "0"),
      sendVerificationRequest: async ({ identifier, token }) => {
        const apiKey = process.env.AUTH_RESEND_KEY;
        const from = process.env.AUTH_EMAIL_FROM ?? "Filament.home <noreply@filament.home>";

        if (!apiKey) {
          console.log(`[filament.home] OTP for ${identifier}: ${token}`);
          return;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: identifier,
            subject: "Your Filament.home sign-in code",
            html: `<p>Your verification code is <b>${token}</b>.</p><p>It expires in 10 minutes.</p>`,
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Failed to send email (${response.status}): ${body}`);
        }
      },
    }),
  ],
});
