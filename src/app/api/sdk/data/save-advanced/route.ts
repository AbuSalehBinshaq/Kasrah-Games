import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface SaveDataRequest {
  gameId: string;
  userId?: string;
  sessionId: string;
  key: string;
  value: any;
  encrypt?: boolean;
}

// دالة التشفير
function encryptData(data: string, key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// دالة فك التشفير
function decryptData(encrypted: string, key: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// POST - حفظ البيانات السحابية
export async function POST(request: NextRequest) {
  try {
    const body: SaveDataRequest = await request.json();
    const { gameId, userId, sessionId, key, value, encrypt } = body;

    if (!gameId || !key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // التحقق من وجود اللعبة
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // تحويل البيانات إلى JSON
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    const dataSize = Buffer.byteLength(jsonValue, 'utf8');

    // التحقق من حد الحجم (2MB افتراضياً)
    const maxDataSize = 2097152; // 2MB
    if (dataSize > maxDataSize) {
      return NextResponse.json(
        { error: 'Data size exceeds limit' },
        { status: 413 }
      );
    }

    // تشفير البيانات إذا طُلب ذلك
    let finalValue = jsonValue;
    if (encrypt) {
      const encryptionKey = process.env.DATA_ENCRYPTION_KEY || 'default-key';
      finalValue = encryptData(jsonValue, encryptionKey);
    }

    // حفظ البيانات
    const savedData = await prisma.sDKGameData.upsert({
      where: {
        userId_gameId_key: {
          userId: userId || sessionId,
          gameId,
          key,
        },
      },
      create: {
        userId: userId || sessionId,
        gameId,
        key,
        value: { data: finalValue, encrypted: encrypt || false },
        size: dataSize,
      },
      update: {
        value: { data: finalValue, encrypted: encrypt || false },
        size: dataSize,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Data saved successfully',
        data: {
          key: savedData.key,
          size: savedData.size,
          encrypted: encrypt || false,
          savedAt: savedData.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

// GET - تحميل البيانات السحابية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const key = searchParams.get('key');

    if (!gameId || (!userId && !sessionId)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const query = {
      where: {
        userId: userId || sessionId,
        gameId,
        ...(key && { key }),
      },
    };

    const data = key
      ? await prisma.sDKGameData.findUnique({
          where: {
            userId_gameId_key: {
              userId: userId || sessionId!,
              gameId,
              key,
            },
          },
        })
      : await prisma.sDKGameData.findMany(query);

    if (!data) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      );
    }

    // فك تشفير البيانات إذا كانت مشفرة
    const processedData = Array.isArray(data)
      ? data.map(item => ({
          ...item,
          value: (item.value as any).encrypted
            ? decryptData((item.value as any).data, process.env.DATA_ENCRYPTION_KEY || 'default-key')
            : (item.value as any).data,
        }))
      : {
          ...data,
          value: (data.value as any).encrypted
            ? decryptData((data.value as any).data, process.env.DATA_ENCRYPTION_KEY || 'default-key')
            : (data.value as any).data,
        };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

// DELETE - حذف البيانات
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const key = searchParams.get('key');

    if (!gameId || (!userId && !sessionId) || !key) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await prisma.sDKGameData.delete({
      where: {
        userId_gameId_key: {
          userId: userId || sessionId!,
          gameId,
          key,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}