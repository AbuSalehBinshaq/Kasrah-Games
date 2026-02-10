import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;

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
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params || {};

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully. Message ID:', data.messageId);
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
 * @param fromEmail - Sender email address
 * @param fromName - Sender name
 * @returns Email send result
 */
export const sendCustomEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  fromEmail: string = 'noreply@kasrahgames.example',
  fromName: string = 'Kasrah Games'
) => {
  if (!apiKey) {
    console.warn('Cannot send email: Brevo API key is not configured');
    return null;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { email: fromEmail, name: fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Custom email sent successfully. Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Error sending custom email:', error);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 * @param email - User email
 * @param name - User name
 * @param username - User username
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  username: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>مرحباً بك في Kasrah Games! 🎮</h1>
          </div>
          <div class="content">
            <p>مرحباً ${name || 'صديقي'},</p>
            <p>شكراً لتسجيلك في Kasrah Games! نحن سعداء بانضمامك إلى مجتمعنا.</p>
            <p>اسم المستخدم الخاص بك: <strong>${username}</strong></p>
            <p>يمكنك الآن الاستمتاع بآلاف الألعاب المجانية والمشاركة في المجتمع.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="button">ابدأ اللعب الآن</a>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. جميع الحقوق محفوظة.</p>
            <p>إذا كان لديك أي أسئلة، تواصل معنا عبر البريد الإلكتروني.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(
    email,
    'مرحباً بك في Kasrah Games! 🎮',
    htmlContent
  );
};

/**
 * Send a password reset email
 * @param email - User email
 * @param name - User name
 * @param resetLink - Password reset link
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetLink: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 20px; color: #856404; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <p>مرحباً ${name || 'صديقي'},</p>
            <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإعادة تعيينها.</p>
            <a href="${resetLink}" class="button">إعادة تعيين كلمة المرور</a>
            <div class="warning">
              <strong>⚠️ تنبيه أمني:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا، يرجى تجاهل هذا البريد.
            </div>
            <p>أو انسخ الرابط التالي في متصفحك:</p>
            <p><code style="background: #e8e8e8; padding: 5px; border-radius: 3px; word-break: break-all;">${resetLink}</code></p>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. جميع الحقوق محفوظة.</p>
            <p>لا تشارك هذا الرابط مع أحد.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(
    email,
    'إعادة تعيين كلمة المرور - Kasrah Games',
    htmlContent
  );
};

/**
 * Send a password reset confirmation email
 * @param email - User email
 * @param name - User name
 */
export const sendPasswordResetConfirmationEmail = async (
  email: string,
  name: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
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
            <h1>تم تغيير كلمة المرور بنجاح ✅</h1>
          </div>
          <div class="content">
            <p>مرحباً ${name || 'صديقي'},</p>
            <div class="success">
              <strong>✅ تم تغيير كلمة المرور بنجاح!</strong> يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </div>
            <p>إذا لم تقم بهذا التغيير، يرجى التواصل معنا فوراً.</p>
          </div>
          <div class="footer">
            <p>© 2026 Kasrah Games. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendCustomEmail(
    email,
    'تم تغيير كلمة المرور بنجاح - Kasrah Games',
    htmlContent
  );
};
