import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getResetEmailHtml(userName: string, resetUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password – CampusNiti</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0c10;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c10;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#13151a,#0d0f14);border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
                <span style="font-size:26px;">🔐</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">CampusNiti</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Campus Infrastructure Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 12px;color:#e2e8f0;font-size:20px;font-weight:600;">Hi ${userName},</h2>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your CampusNiti account. Click the button below to create a new password.
              </p>
              <p style="margin:0 0 28px;color:#64748b;font-size:13px;line-height:1.5;">
                ⏰ This link is valid for <strong style="color:#94a3b8;">1 hour</strong> from when this email was sent.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:28px 0 0;color:#64748b;font-size:12px;text-align:center;">
                Button not working? Copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color:#818cf8;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
                <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
                  🛡️ <strong style="color:#64748b;">Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. No one has access to your account.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.2);padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#334155;font-size:12px;">
                © ${new Date().getFullYear()} CampusNiti · NIT Jalandhar<br/>
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = getSupabase();
        const { data: user } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('email', email.toLowerCase().trim())
            .single();

        // Always return the same message to prevent email enumeration attacks
        const genericResponse = { message: "If an account with that email exists, we've sent a password reset link. Please check your inbox (and spam folder)." };

        if (!user) return NextResponse.json(genericResponse);

        // Generate a secure, random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour

        // Invalidate any previous unused tokens for this user
        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('user_id', user.id)
            .eq('used', false);

        // Store new token
        const { error: dbError } = await supabase.from('password_reset_tokens').insert({
            user_id: user.id,
            token,
            expires_at: expiresAt.toISOString(),
            used: false,
        });

        if (dbError) {
            console.error('Failed to store reset token in database:', dbError);
            return NextResponse.json({ error: 'Database error occurred. Please make sure the password_reset_tokens table exists.' }, { status: 500 });
        }

        // Build the reset URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${appUrl}/reset-password?token=${token}`;

        // Send the email via Resend
        const { error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'CampusNiti <onboarding@resend.dev>',
            to: user.email,
            subject: 'Reset your CampusNiti password',
            html: getResetEmailHtml(user.name || 'there', resetUrl),
        });

        if (emailError) {
            console.error('Resend email error:', emailError);
            // Don't expose internal error to client but log it
            return NextResponse.json({ error: 'Failed to send reset email. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json(genericResponse);
    } catch (err) {
        console.error('Forgot password error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
