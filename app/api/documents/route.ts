import { NextRequest, NextResponse } from 'next/server';
import { knowledgeEngine } from '@/lib/knowledge/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'user-ethiopia-01';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    let docs = knowledgeEngine.getDocuments(userId);

    if (category) {
      docs = docs.filter(d => d.category.toLowerCase() === category.toLowerCase() || d.folder.toLowerCase() === category.toLowerCase());
    }
    if (tag) {
      docs = docs.filter(d => d.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    return NextResponse.json({ success: true, documents: docs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'user-ethiopia-01';

    if (!body.title || !body.fileName) {
      return NextResponse.json({ success: false, error: 'Title and fileName are required' }, { status: 400 });
    }

    const savedDoc = knowledgeEngine.saveDocument(body, userId);
    return NextResponse.json({ success: true, document: savedDoc });
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
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const deleted = knowledgeEngine.deleteDocument(id, userId);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}