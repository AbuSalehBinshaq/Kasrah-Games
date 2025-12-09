import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Initialize Resend if API key is available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    // Save to database (optional)
    // For now, we'll just log it and send email if configured

    console.log('Contact form submission:', { name, email, subject, message });

    // Send email if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Kasrah Games <noreply@kasrahgames.example>',
          to: process.env.CONTACT_EMAIL || 'info@kasrahgames.example',
          subject: `Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue anyway - we don't want form submission to fail because of email
      }
    }

    // Send auto-reply if configured
    if (resend && email) {
      try {
        await resend.emails.send({
          from: 'Kasrah Games <noreply@kasrahgames.example>',
          to: email,
          subject: 'Thank you for contacting Kasrah Games',
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
            <p><strong>Your message:</strong></p>
            <p>${message}</p>
            <br/>
            <p>Best regards,<br/>The Kasrah Games Team</p>
          `,
        });
      } catch (replyError) {
        console.error('Failed to send auto-reply:', replyError);
      }
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
