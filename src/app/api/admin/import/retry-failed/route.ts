import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAction } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { runImport } from '@/lib/import/orchestrator';

/**
 * POST /api/admin/import/retry-failed
 *
 * Re-runs import for all sources that have failed opportunities.
 * This triggers a full fresh scrape of enabled sources (which will re-process
 * any previously-failed listings).
 */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Count failed opportunities for context
  const failedCount = await db.opportunity.count({ where: { importStatus: 'failed' } });

  // Run all enabled sources
  const summary = await runImport({ triggeredBy: `retry:${admin.email}` });

  await logAction({
    userId: admin.id,
    action: 'import_retry_failed',
    entity: 'importRun',
    entityId: summary.runId,
    details: `previously failed: ${failedCount}`,
    req,
  });

  return NextResponse.json({ success: true, summary, previouslyFailed: failedCount });
}
