import { NextRequest, NextResponse } from 'next/server';
import { knowledgeEngine } from '@/lib/knowledge/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'user-ethiopia-01';
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') || 'all') as any;
    const tag = searchParams.get('tag') || undefined;
    const relatedToId = searchParams.get('relatedTo');

    if (relatedToId) {
      const related = knowledgeEngine.getRelatedItems(relatedToId, userId, 6);
      return NextResponse.json({ success: true, related });
    }

    const results = knowledgeEngine.search({
      query,
      type,
      tag,
      limit: 30
    }, userId);

    const stats = knowledgeEngine.getStats(userId);

    return NextResponse.json({
      success: true,
      query,
      results,
      stats
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'user-ethiopia-01';
    const { itemType, title, description, category, tags } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    if (itemType === 'idea') {
      const idea = knowledgeEngine.saveIdea({ title, description: description || '', category, tags }, userId);
      return NextResponse.json({ success: true, item: idea });
    }

    return NextResponse.json({ success: false, error: 'Unsupported knowledge item type for quick capture' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}