import { NextRequest, NextResponse } from 'next/server';
import { universalSearchEngine, SearchDomain } from '@/lib/search/universal-search';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const domain = (searchParams.get('domain') || 'all') as SearchDomain | 'all';
    const userId = searchParams.get('userId') || 'user-ethiopia-01';

    const results = universalSearchEngine.search({
      query,
      domain,
      limit: 30
    }, userId);

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}