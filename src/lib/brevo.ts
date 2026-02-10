import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kasrah.news@gmail.com';
const FROM_NAME = 'Kasrah Games';

if (!apiKey) {
  console.warn('⚠️ Brevo API key is not set. Email functionality will be disabled.');
}

// Initialize the API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

if (apiKey) {
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    apiKey
  );
}

/**
 * Send a transactional email using Brevo
 * @param to - Recipient email and optional name
 * @param templateId - Brevo template ID
 * @param params - Template variables
 * @returns Email send result
 */
export const sendTransactionalEmail = async (
  to: { email: string; name?: string },
  templateId: number,
  params?: { [key: string]: any }
) => {
  if (!apiKey) {
    console.warn('Cannot send email: Brevo API key is not configured');
    return null;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to.email, name: to.name || '' }];
    sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params || {};

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully. Message ID:', data.body.messageId);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Send a custom email using Brevo
 * @param to - Recipient email
 * @param subject - Email subject
 * @param htmlContent - HTML email content
 * @returns Email send result
 */
export const sendCustomEmail = async (
  to: string,
  subject: string,
  htmlContent: string
) => {
  if (!apiKey) {
    console.warn('Cannot send email: Brevo API key is not configured');
    return null;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Custom email sent successfully. Message ID:', data.body.messageId);
    return data;
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  username: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .button { display: inline-block; background: #667eea; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Kasrah Games! 🎮</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for registering at Kasrah Games! We are excited to have you in our community.</p>
            <p>Your username: <strong>${username}</strong></p>
            <p>You can now enjoy thousands of free games and participate in the community.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="button">Start Playing Now</a>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(email, 'Welcome to Kasrah Games! 🎮', htmlContent);
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetLink: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .button { display: inline-block; background: #e74c3c; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 20px; color: #856404; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>You requested to reset your password. Click the button below to reset it.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Security Note:</strong> This link is valid for 1 hour only.
            </div>
            <p>Or copy the following link:</p>
            <p><code style="background: #e8e8e8; padding: 5px; border-radius: 3px; word-break: break-all;">${resetLink}</code></p>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(email, 'Password Reset - Kasrah Games', htmlContent);
};

/**
 * Send a password reset confirmation email
 */
export const sendPasswordResetConfirmationEmail = async (
  email: string,
  name: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .success { background: #d4edda; border: 1px solid #28a745; padding: 10px; border-radius: 5px; margin-top: 20px; color: #155724; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully ✅</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <div class="success">
              <strong>✅ Your password has been changed successfully!</strong>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(email, 'Password Changed Successfully - Kasrah Games', htmlContent);
};

/**
 * Send an email verification link
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationLink: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .button { display: inline-block; background: #7c3aed; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for joining Kasrah Games! Please verify your email address to unlock all features.</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy this link to your browser:</p>
            <p><code style="background: #e8e8e8; padding: 5px; border-radius: 3px; word-break: break-all;">${verificationLink}</code></p>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(email, 'Verify Your Email - Kasrah Games', htmlContent);
};
