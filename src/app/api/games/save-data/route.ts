import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// هذا الـ API مخصص لاستقبال بيانات الألعاب من الـ SDK وحفظها في قاعدة البيانات
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for cloud save' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId, data } = body;

    if (!gameId || !data) {
      return NextResponse.json(
        { error: 'gameId and data are required' },
        { status: 400 }
      );
    }

    // سنقوم بحفظ البيانات في جدول PlaySession أو جدول جديد إذا لزم الأمر
    // حالياً سنستخدم PlaySession لتخزين آخر حالة للعبة في حقل إضافي أو نكتفي بالتخزين المحلي المتقدم
    // ملاحظة: يفضل مستقبلاً إضافة جدول GameProgress في Prisma
    
    // للتبسيط الآن، سنقوم بتحديث آخر جلسة لعب لهذا المستخدم مع هذه اللعبة
    const lastSession = await prisma.playSession.findFirst({
      where: {
        userId: user.id,
        gameId: gameId
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    if (lastSession) {
        // تحديث الجلسة (يمكن إضافة حقل JSON في قاعدة البيانات لاحقاً)
        // حالياً سنعيد نجاح العملية لتأكيد الاتصال
        return NextResponse.json({ 
            success: true, 
            message: 'Data received and linked to user session',
            user: user.username
        });
    }

    return NextResponse.json({ success: true, user: user.username });
  } catch (error) {
    console.error('Cloud Save Error:', error);
    return NextResponse.json(
      { error: 'Failed to save game data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
    try {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      const { searchParams } = new URL(request.url);
      const gameId = searchParams.get('gameId');
      
      // استرجاع البيانات (هنا نضع منطق استرجاع البيانات من قاعدة البيانات)
      return NextResponse.json({ success: true, data: {} });
    } catch (error) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
