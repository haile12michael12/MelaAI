import { NextRequest, NextResponse } from 'next/server';
import { knowledgeEngine } from '@/lib/knowledge/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'user-ethiopia-01';
    const folder = searchParams.get('folder');
    const tag = searchParams.get('tag');
    const favorite = searchParams.get('favorite');

    let notes = knowledgeEngine.getNotes(userId);

    if (folder) {
      notes = notes.filter(n => n.folder.toLowerCase() === folder.toLowerCase());
    }
    if (tag) {
      notes = notes.filter(n => n.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (favorite === 'true') {
      notes = notes.filter(n => n.isFavorite);
    }

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'user-ethiopia-01';

    if (!body.title || body.content === undefined) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const savedNote = knowledgeEngine.saveNote(body, userId);
    return NextResponse.json({ success: true, note: savedNote });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-ethiopia-01';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    const deleted = knowledgeEngine.deleteNote(id, userId);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}