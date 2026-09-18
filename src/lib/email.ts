import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.EMAIL_FROM || 'NADOS <noreply@nados.iq>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9090';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function getBaseTemplate(content: string, locale: 'ar' | 'en' = 'ar'): EmailTemplate {
  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const lang = isRtl ? 'ar' : 'en';
  
  const texts = {
    ar: {
      greeting: 'مرحباً',
      regards: 'مع التحية،',
      team: 'فريق نادوس',
      unsubscribe: 'إذا كنت لا تريد تلقي هذه الرسائل، يمكنك',
      managePreferences: 'إدارة تفضيلاتك',
    },
    en: {
      greeting: 'Hello',
      regards: 'Best regards,',
      team: 'NADOS Team',
      unsubscribe: 'If you don\'t want to receive these emails, you can',
      managePreferences: 'manage your preferences',
    },
  };
  
  const t = texts[locale];
  
  return {
    subject: '',
    html: `
      <!DOCTYPE html>
      <html dir="${dir}" lang="${lang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">NADOS</h1>
        </div>
        <div class="content">
          ${content}
          <div class="footer">
            <p>${t.regards}<br>${t.team}</p>
            <p>${t.unsubscribe} <a href="${APP_URL}/settings/notifications">${t.managePreferences}</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: '',
  };
}

export async function sendVerificationEmail(email: string, token: string, locale: 'ar' | 'en' = 'ar'): Promise<void> {
  const verifyUrl = `${APP_URL}/${locale}/auth/verify-email?token=${token}`;
  const t = locale === 'ar' 
    ? { greeting: 'مرحباً', subject: 'تفعيل حسابك في نادوس', verify: 'تفعيل الحساب', message: 'شكراً لتسجيلك في نادوس. اضغط على الزر أدناه لتفعيل حسابك:' }
    : { greeting: 'Hello', subject: 'Verify your NADOS account', verify: 'Verify Account', message: 'Thanks for signing up for NADOS. Click the button below to verify your account:' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" class="button">${t.verify}</a>
    </p>
    <p>أو انسخ هذا الرابط في متصفحك:<br><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>هذا الرابط ينتهي صلاحيته خلال 24 ساعة.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: 'ar' | 'en' = 'ar'): Promise<void> {
  const resetUrl = `${APP_URL}/${locale}/auth/reset-password?token=${token}`;
  const t = locale === 'ar'
    ? { greeting: 'مرحباً', subject: 'إعادة تعيين كلمة المرور - نادوس', reset: 'إعادة تعيين كلمة المرور', message: 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه:' }
    : { greeting: 'Hello', subject: 'Reset your NADOS password', reset: 'Reset Password', message: 'We received a request to reset your password. Click the button below:' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">${t.reset}</a>
    </p>
    <p>أو انسخ هذا الرابط في متصفحك:<br><a href="${resetUrl}">${resetUrl}</a></p>
    <p>هذا الرابط ينتهي صلاحيته خلال ساعة واحدة. إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendRequestSubmittedEmail(
  email: string,
  requestTitle: string,
  requestId: string,
  locale: 'ar' | 'en' = 'ar'
): Promise<void> {
  const t = locale === 'ar'
    ? { greeting: 'مرحباً', subject: 'تم استلام طلبك - نادوس', message: 'تم استلام طلبك بنجاح. سيقوم فريقنا بمراجعته والرد عليك قريباً.' }
    : { greeting: 'Hello', subject: 'Request Received - NADOS', message: 'Your request has been received successfully. Our team will review it and get back to you soon.' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>عنوان الطلب:</strong> ${requestTitle}</p>
      <p><strong>رقم الطلب:</strong> ${requestId}</p>
    </div>
    <p>يمكنك متابعة حالة طلبك من <a href="${APP_URL}/${locale}/dashboard/requests">لوحة التحكم</a>.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendRequestStatusUpdateEmail(
  email: string,
  requestTitle: string,
  status: string,
  adminNote: string,
  locale: 'ar' | 'en' = 'ar'
): Promise<void> {
  const statusLabels: Record<string, { ar: string; en: string }> = {
    accepted: { ar: 'مقبول', en: 'Accepted' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    needs_info: { ar: 'يحتاج معلومات إضافية', en: 'Needs More Info' },
    under_review: { ar: 'قيد المراجعة', en: 'Under Review' },
  };
  
  const label = statusLabels[status]?.[locale] || status;
  const t = locale === 'ar'
    ? { greeting: 'مرحباً', subject: `تحديث على طلبك: ${label} - نادوس`, message: 'تم تحديث حالة طلبك:' }
    : { greeting: 'Hello', subject: `Request Update: ${label} - NADOS`, message: 'Your request status has been updated:' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>عنوان الطلب:</strong> ${requestTitle}</p>
      <p><strong>الحالة الجديدة:</strong> <span style="color: ${status === 'accepted' ? '#059669' : status === 'rejected' ? '#dc2626' : '#d97706'}; font-weight: 600;">${label}</span></p>
      ${adminNote ? `<p><strong>ملاحظة:</strong> ${adminNote}</p>` : ''}
    </div>
    <p>يمكنك عرض التفاصيل الكاملة من <a href="${APP_URL}/${locale}/dashboard/requests">لوحة التحكم</a>.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendProjectPublishedEmail(
  email: string,
  projectName: string,
  publicUrl: string,
  locale: 'ar' | 'en' = 'ar'
): Promise<void> {
  const t = locale === 'ar'
    ? { greeting: 'مرحباً', subject: 'تم نشر مشروعك في المعرض - نادوس', message: 'تهانينا! تم نشر مشروعك بنجاح في المعرض العام.' }
    : { greeting: 'Hello', subject: 'Your Project is Published - NADOS', message: 'Congratulations! Your project has been successfully published to the public showcase.' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>اسم المشروع:</strong> ${projectName}</p>
      <p><strong>الرابط العام:</strong> <a href="${publicUrl}">${publicUrl}</a></p>
    </div>
    <p>يمكنك إلغاء النشر في أي وقت من إعدادات المشروع.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  subject: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  const template = getBaseTemplate(`
    <p>${message}</p>
    ${actionUrl ? `<p style="text-align: center; margin: 30px 0;"><a href="${actionUrl}" class="button">عرض التفاصيل</a></p>` : ''}
  `, 'ar');
  
  template.subject = subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAccountDeletionEmail(
  email: string,
  locale: 'ar' | 'en' = 'ar'
): Promise<void> {
  const t = locale === 'ar'
    ? { greeting: 'مرحباً', subject: 'تم حذف حسابك - نادوس', message: 'تم حذف حسابك بنجاح. يمكنك استعادة الحساب خلال 30 يوماً من خلال صفحة الاسترداد.' }
    : { greeting: 'Hello', subject: 'Account Deleted - NADOS', message: 'Your account has been deleted. You can recover it within 30 days through the recovery page.' };

  const template = getBaseTemplate(`
    <p>${t.greeting},</p>
    <p>${t.message}</p>
    <p><a href="${APP_URL}/${locale}/restore">صفحة استعادة الحساب</a></p>
    <p>بعد 30 يوماً، سيتم حذف بياناتك نهائياً ولا يمكن استعادتها.</p>
  `, locale);
  
  template.subject = t.subject;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}