import nodemailer from "nodemailer";

interface SendOtpOptions {
  to: string;
  otp: string;
  userName?: string;
}

export async function sendOtpEmail({ to, otp, userName }: SendOtpOptions): Promise<{ success: boolean; provider: string; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mã xác thực Trọ Biển Nha Trang</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #034A75 0%, #026AA7 50%, #01588B 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">TRỌ BIỂN NHA TRANG</h1>
            <p style="color: #bae6fd; margin: 6px 0 0 0; font-size: 12px; font-weight: 500;">Tìm phòng gần biển • An tâm giá tốt</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 28px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">
              Xin chào <strong>${userName || "bạn"}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #475569;">
              Bạn đang thực hiện xác thực tài khoản trên <strong>Trọ Biển Nha Trang</strong>. Dưới đây là mã xác thực OTP dùng một lần của bạn:
            </p>

            <!-- OTP Box -->
            <div style="background: linear-gradient(to right, #FFF7ED, #FEF3C7); border: 2px dashed #F59E0B; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #EA580C; display: inline-block;">
                ${otp}
              </span>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9A3412; font-weight: 600;">
                Mã có hiệu lực trong vòng <strong>5 phút</strong>
              </p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; margin: 20px 0 0 0; color: #64748b;">
              ⚠️ <em>Lưu ý bảo mật: Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Đội ngũ Trọ Biển Nha Trang không bao giờ yêu cầu cung cấp mã OTP của bạn.</em>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Đây là email tự động từ hệ thống <strong>Trọ Biển Nha Trang</strong>.<br>
            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 1. Kiểm tra Resend API Key (Nếu người dùng dùng Resend - Gói Miễn phí 3.000 email/tháng)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Trọ Biển Nha Trang <onboarding@resend.dev>",
          to: [to],
          subject: `[Trọ Biển Nha Trang] Mã xác thực OTP của bạn là ${otp}`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        console.log(`[Email OTP] Gửi thành công qua Resend tới ${to}`);
        return { success: true, provider: "resend" };
      }
      const errData = await res.json().catch(() => ({}));
      console.warn("[Email OTP Resend Error]", errData);
    } catch (err: any) {
      console.warn("[Email OTP Resend Exception]", err?.message);
    }
  }

  // 2. Kiểm tra Gmail SMTP / Nodemailer (Miễn phí 500 email/ngày của Google)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    try {
      const cleanUser = gmailUser.trim();
      const cleanPass = gmailPass.replace(/\s+/g, "").trim();

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });

      await transporter.sendMail({
        from: `"Trọ Biển Nha Trang" <${cleanUser}>`,
        to,
        subject: `[Trọ Biển Nha Trang] Mã xác thực OTP: ${otp}`,
        text: `Xin chào ${userName || "bạn"},\n\nMã xác thực OTP của bạn là: ${otp}\nMã có hiệu lực trong 10 phút.\n\nTrân trọng,\nĐội ngũ Trọ Biển Nha Trang`,
        html: htmlContent,
      });

      console.log(`[Email OTP] Gửi thành công qua Gmail SMTP tới ${to}`);
      return { success: true, provider: "gmail_smtp" };
    } catch (err: any) {
      console.error("[Email OTP Gmail SMTP Error]", err);
      return { success: false, provider: "gmail_smtp", error: err.message };
    }
  }

  // 3. Fallback khi chưa cấu hình key (chế độ demo an toàn, không làm đứt đoạn quy trình web)
  console.log(`[Email OTP Demo] Mã OTP cho ${to} là: ${otp} (Chưa cấu hình RESEND_API_KEY hoặc GMAIL_USER/GMAIL_APP_PASSWORD)`);
  return { success: false, provider: "none", error: "Chưa cấu hình tài khoản gửi email" };
}
