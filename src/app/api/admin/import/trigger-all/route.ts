import { NextResponse } from 'next/server';
import { runImport } from '@/lib/import/orchestrator';

/**
 * Simple trigger endpoint that bypasses admin auth for initial setup
 * GET /api/admin/import/trigger-all
 */
export async function GET() {
  try {
    console.log('🚀 Starting import for all sources...');
    
    const summary = await runImport({
      sourceId: null, // null = run all sources
      type: null,
      triggeredBy: 'setup',
    });

    return NextResponse.json({
      success: true,
      message: 'Import completed successfully! ✅',
      summary,
      nextSteps: [
        '✅ Import complete!',
        '1. Visit homepage: https://www.myariahub.com',
        '2. You should see opportunities listed',
        '3. Check admin panel for imported data',
      ]
    });

  } catch (error: any) {
    console.error('❌ Import failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
