import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  siteLogo: z.string().url().optional().nullable(),
  siteFavicon: z.string().url().optional().nullable(),
  siteUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  socialFacebook: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialYoutube: z.string().url().optional().nullable(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional().nullable(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  gamesPerPage: z.number().int().min(1).max(100).optional(),
  enableRatings: z.boolean().optional(),
  enableComments: z.boolean().optional(),
  enableBookmarks: z.boolean().optional(),
  showStatistics: z.boolean().optional(),
  primaryColor: z.string().min(3).optional(),
  primaryColorHover: z.string().min(3).optional(),
  backgroundFrom: z.string().min(3).optional(),
  backgroundTo: z.string().min(3).optional(),
  enableAnalytics: z.boolean().optional(),
  analyticsCode: z.string().optional().nullable(),
  seoMetaTitle: z.string().optional().nullable(),
  seoMetaDescription: z.string().optional().nullable(),
  seoMetaKeywords: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Get or create settings (singleton pattern)
    let settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      // Create default settings if they don't exist
      try {
        settings = await prisma.settings.create({
          data: {
            id: 'site-settings',
          },
        });
      } catch (createError: any) {
        // If create fails, try to find again (race condition)
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

    // Get or create settings
    let settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'site-settings',
          ...validation.data,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: 'site-settings' },
        data: validation.data,
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

