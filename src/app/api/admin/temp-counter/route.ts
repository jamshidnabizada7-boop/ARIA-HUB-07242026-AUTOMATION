import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Find and update "Countries Served" -> "Global Reach"
    const counters = await db.counter.findMany();
    let updated = 0;
    
    for (const counter of counters) {
      if (counter.label.includes('Countries') || counter.label.includes('کشور')) {
        await db.counter.update({
          where: { id: counter.id },
          data: {
            label: 'Global Reach',
            labelI18n: { en: 'Global Reach', fa: 'دسترسی جهانی', ps: 'نړیوال لاسرسی' }
          }
        });
        updated++;
      }
      
      if (counter.label.includes('Visa') || counter.label.includes('ویزا')) {
        await db.counter.update({
          where: { id: counter.id },
          data: {
            label: 'Visa & Admission Support',
            labelI18n: { en: 'Visa & Admission Support', fa: 'پشتیبانی ویزا و پذیرش', ps: 'د ویزې او داخلې ملاتړ' }
          }
        });
        updated++;
      }
    }

    return NextResponse.json({ success: true, message: `Updated ${updated} counters.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
