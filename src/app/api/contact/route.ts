import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendCustomEmail } from '@/lib/brevo';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kasrah.news@gmail.com';

    console.log('Contact form submission:', { name, email, subject, message });

    // Send email to admin using Brevo
    try {
      await sendCustomEmail(
        contactEmail,
        `Contact Form: ${subject}`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
          </div>
        `
      );
      console.log(`✅ Contact email sent to admin: ${contactEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send contact email to admin:', emailError);
    }

    // Send auto-reply to user using Brevo
    try {
      await sendCustomEmail(
        email,
        'Thank you for contacting Kasrah Games',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you as soon as possible (within 24-48 hours).</p>
            <p><strong>Your message:</strong></p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</p>
            <br/>
            <p>Best regards,<br/>The Kasrah Games Team</p>
          </div>
        `
      );
      console.log(`✅ Auto-reply sent to user: ${email}`);
    } catch (replyError) {
      console.error('❌ Failed to send auto-reply to user:', replyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
