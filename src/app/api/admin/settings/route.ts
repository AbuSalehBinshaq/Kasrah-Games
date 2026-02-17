import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  siteLogo: z.string().optional().nullable(),
  siteFavicon: z.string().optional().nullable(),
  siteUrl: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialTwitter: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional().nullable(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  gamesPerPage: z.number().int().min(1).max(100).optional(),
  enableRatings: z.boolean().optional(),
  enableComments: z.boolean().optional(),
  enableBookmarks: z.boolean().optional(),
  showStatistics: z.boolean().optional(),
  primaryColor: z.string().optional().nullable(),
  primaryColorHover: z.string().optional().nullable(),
  backgroundFrom: z.string().optional().nullable(),
  backgroundTo: z.string().optional().nullable(),
  enableAnalytics: z.boolean().optional(),
  analyticsCode: z.string().optional().nullable(),
  seoMetaTitle: z.string().optional().nullable(),
  seoMetaDescription: z.string().optional().nullable(),
  seoMetaKeywords: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    let settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      try {
        settings = await prisma.settings.create({
          data: {
            id: 'site-settings',
          },
        });
      } catch (createError: any) {
        if (createError.code === 'P2002') {
          settings = await prisma.settings.findUnique({
            where: { id: 'site-settings' },
          });
        } else {
          throw createError;
        }
      }
    }

    if (!settings) {
      throw new Error('Failed to create or retrieve settings');
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('required') || errorMessage.includes('Authentication') ? 401 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = settingsSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Sanitize data for Prisma: convert nulls to undefined for fields that don't support null
    // or ensure they match the schema expectations.
    const sanitizedData: any = { ...validation.data };
    
    // Prisma create/update types can be strict about null vs undefined
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === null) {
        // If the field in Prisma schema is optional but not nullable, 
        // we should use undefined instead of null.
        // For safety in this generic update, we'll keep nulls only if they are explicitly allowed.
        // Based on the error, primaryColor doesn't like null.
        sanitizedData[key] = undefined;
      }
    });

    let settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'site-settings',
          ...sanitizedData,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: 'site-settings' },
        data: sanitizedData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}
