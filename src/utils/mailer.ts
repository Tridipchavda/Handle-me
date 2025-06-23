import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEventNotification({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="color: #007BFF;">📅 Event Reminder</h2>
      <p style="font-size: 16px;">Hi there,</p>
      <p style="font-size: 16px;">
        This is a friendly reminder about your upcoming event:
      </p>
      <blockquote style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 5px solid #007BFF;">
        <strong>${subject}</strong><br/>
        ${text}
      </blockquote>
      <p style="font-size: 16px;">
        Make sure you're ready and set a reminder if needed.
      </p>
      <p style="font-size: 16px;">Good luck! 🎉</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />
      <footer style="font-size: 12px; color: #999;">
        Sent from handle-me .
      </footer>
    </div>
  `;

  await transporter.sendMail({
    from: `"Event Reminder" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
}
