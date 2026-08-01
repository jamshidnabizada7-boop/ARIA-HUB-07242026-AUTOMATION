import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const existing = await db.importSource.findFirst({
      where: { scraperKey: 'acbar' }
    });

    if (!existing) {
      await db.importSource.create({
        data: {
          name: 'ACBAR Jobs',
          type: 'job',
          scraperKey: 'acbar',
          baseUrl: 'https://www.acbar.org/en/jobs',
          enabled: true,
          autoPublish: true,
          scheduleMinutes: 360,
        }
      });
      return NextResponse.json({ success: true, message: 'Added ACBAR to ImportSources. You can now see it in the Admin Panel.' });
    } else {
      return NextResponse.json({ success: true, message: 'ACBAR already exists.' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
