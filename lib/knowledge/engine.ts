import {
  KnowledgeItem,
  NoteItem,
  DocumentItem,
  BookNoteItem,
  SavedArticleItem,
  IdeaItem,
  SearchOptions,
  SearchResultItem,
  RelatedItemMatch,
  KnowledgeStats,
} from './types';

export function generateSemanticVector(text: string, dimensions = 32): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return vector;
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => val / magnitude);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dot));
}

const DEFAULT_USER_ID = 'user-ethiopia-01';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    userId: DEFAULT_USER_ID,
    title: 'እቁብ እና ቁጠባ ዕቅድ (Equb & Savings Strategy)',
    content: `# እቁብ እና ቁጠባ ዕቅድ (2026/2027)\n\n## 1. የካፒታል ምደባ\n- **ወርሃዊ እቁብ መዋጮ**: 12,000 ETB\n- **የአደጋ ጊዜ ፈንድ**: 6,000 ETB በወር\n- **የንግድ ማስፋፊያ ቁጠባ**: 8,000 ETB\n\n## 2. የዕቁብ ዙር እቅድ\n1. ዙር 4 ሲደርስ የሚሰበሰበውን 120,000 ETB በቀጥታ ወደ ከፍተኛ ወለድ ማስቀመጫ ማስተላለፍ።\n2. የዋጋ ግሽበትን ለመከላከል የውጭ ምንዛሪ ወይም የወርቅ ንብረት ማጠናከር።\n\n## ማስታወሻ\nበየወሩ 5ኛ ቀን ክፍያው መፈጸሙን ማረጋገጥ።`,
    folder: 'Finance & Budget',
    tags: ['Equb', 'Finance', 'Savings', 'Ethiopia', 'ETB'],
    isFavorite: true,
    isPinned: true,
    attachments: [
      { id: 'att-1', name: 'equb_schedule_2026.pdf', size: 245000, type: 'application/pdf', uploadedAt: '2026-08-15T10:00:00Z' }
    ],
    wordCount: 78,
    readingTimeMinutes: 1,
    createdAt: '2026-08-01T08:30:00Z',
    updatedAt: '2026-09-05T14:20:00Z',
  },
  {
    id: 'note-2',
    userId: DEFAULT_USER_ID,
    title: 'Ethiopian Commercial Code Revision Notes',
    content: `# Ethiopian Commercial Code & Tax Guidelines\n\n### Key Highlights for Tech Startups:\n- Mandatory digital invoicing and ERCA compliance.\n- Minimum capital requirement adjustments for share companies vs private limited companies (PLC).\n- Withholding tax rates (2% on local supplies, 15% on foreign digital services).\n\n### Action Items:\n- [ ] Consult tax advisor on withholding tax certificates.\n- [ ] Implement automated VAT calculation module for Ethiopian Birr transactions.`,
    folder: 'Legal & Tax',
    tags: ['Tax', 'Legal', 'PLC', 'ERCA', 'Startups'],
    isFavorite: true,
    isPinned: false,
    attachments: [],
    wordCount: 65,
    readingTimeMinutes: 1,
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-02T09:15:00Z',
  },
  {
    id: 'note-3',
    userId: DEFAULT_USER_ID,
    title: 'Specialty Coffee Export Logistics & Sourcing',
    content: `# Ethiopian Specialty Coffee Sourcing (Yirgacheffe & Guji)\n\n- Grade 1 Natural processed coffee cupping score > 88.\n- ECX delivery points and direct trade export regulations.\n- Target FOB pricing: $4.80 - $5.50 / lb.\n- Logistics partner: Ethiopian Airlines Cargo + Port of Djibouti transit.`,
    folder: 'Business & Ventures',
    tags: ['Coffee', 'Export', 'Logistics', 'Trade', 'Yirgacheffe'],
    isFavorite: false,
    isPinned: false,
    attachments: [
      { id: 'att-2', name: 'coffee_cupping_report.xlsx', size: 512000, type: 'application/vnd.ms-excel', uploadedAt: '2026-08-20T12:00:00Z' }
    ],
    wordCount: 52,
    readingTimeMinutes: 1,
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: '2026-08-25T16:40:00Z',
  }
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    userId: DEFAULT_USER_ID,
    title: 'Addis Chamber Commercial Lease Agreement 2026',
    fileName: 'commercial_lease_addis_2026.pdf',
    fileSize: 1845000,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    storageUrl: '/storage/docs/commercial_lease_addis_2026.pdf',
    folder: 'Legal & Real Estate',
    category: 'Contracts',
    tags: ['Lease', 'Office', 'Addis Ababa', 'Legal', 'Contract'],
    description: 'Signed 3-year office lease contract in Bole Medhanialem with 10% annual escalation cap.',
    previewText: 'This Commercial Lease Agreement is made between Lessor and Tenant for Office Suite 402, Bole Subcity, Addis Ababa. Rent: 65,000 ETB/month payable quarterly in advance...',
    uploadedAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-15T09:00:00Z',
    isEncrypted: true
  },
  {
    id: 'doc-2',
    userId: DEFAULT_USER_ID,
    title: 'Annual Audited Financial Statements FY2025',
    fileName: 'audited_financials_fy2025.xlsx',
    fileSize: 3420000,
    fileType: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    storageUrl: '/storage/docs/audited_financials_fy2025.xlsx',
    folder: 'Finance & Accounting',
    category: 'Financial Statements',
    tags: ['Audit', 'Balance Sheet', 'Income Statement', 'Finance', 'Tax'],
    description: 'Complete GAAP audited balance sheet, cash flows, and profit & loss report verified by external certified auditors.',
    previewText: 'Summary Balance Sheet (All values in ETB): Total Assets: 4,850,000 | Total Current Liabilities: 1,200,000 | Retained Earnings: 2,400,000 | Net Revenue: 8,920,000...',
    uploadedAt: '2026-08-05T14:30:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
    isEncrypted: true
  },
  {
    id: 'doc-3',
    userId: DEFAULT_USER_ID,
    title: 'National Bank of Ethiopia FX Directive FXD/84/2025',
    fileName: 'nbe_fx_directive_84.pdf',
    fileSize: 890000,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    storageUrl: '/storage/docs/nbe_fx_directive_84.pdf',
    folder: 'Regulatory & Banking',
    category: 'Regulations',
    tags: ['Banking', 'NBE', 'Forex', 'Regulations', 'ETB', 'USD'],
    description: 'Official National Bank directive governing foreign exchange surrender rules, export retention accounts, and import letters of credit.',
    previewText: 'National Bank of Ethiopia Directive No. FXD/84/2025: Foreign Exchange Operations and Market-Determined Exchange Rates Framework for Commercial Banks...',
    uploadedAt: '2026-08-18T10:15:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
    isEncrypted: false
  }
];

const INITIAL_BOOK_NOTES: BookNoteItem[] = [
  {
    id: 'bn-1',
    userId: DEFAULT_USER_ID,
    bookTitle: 'The Psychology of Money',
    author: 'Morgan Housel',
    chapter: 'Chapter 7: Freedom',
    page: 84,
    quote: 'The highest form of wealth is the ability to wake up every morning and say, "I can do whatever I want today."',
    reflection: 'Building net worth is not about luxury consumption; it is about buying autonomy and controlling your time.',
    tags: ['Finance', 'Psychology', 'Wealth', 'Books', 'Mindset'],
    createdAt: '2026-07-28T16:00:00Z'
  },
  {
    id: 'bn-2',
    userId: DEFAULT_USER_ID,
    bookTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    chapter: 'System 1 and System 2',
    page: 28,
    quote: 'A reliable way to make people believe in falsehoods is frequent repetition, because familiarity is not easily distinguished from truth.',
    reflection: 'Apply this to financial decision-making: avoid FOMO hype cycles in asset investments by forcing deliberate System 2 checklists.',
    tags: ['Psychology', 'Decision Making', 'Mental Models', 'Books'],
    createdAt: '2026-08-14T19:30:00Z'
  }
];

const INITIAL_SAVED_ARTICLES: SavedArticleItem[] = [
  {
    id: 'art-1',
    userId: DEFAULT_USER_ID,
    title: 'Ethiopian Digital Payments & Telebirr Ecosystem Growth 2026',
    url: 'https://techinafrica.et/telebirr-growth-2026',
    source: 'Tech in Africa',
    summary: 'Analysis of mobile money transactions surpassing 1.5 trillion ETB in Ethiopia, merchant adoption rates, and interoperability with EthSwitch.',
    keyTakeaways: [
      'Over 45 million active mobile money wallets across telecom and bank apps.',
      'Merchant QR code payment volumes up 220% year over year.',
      'Fintech API integrations enabling automated micro-savings and micro-credit.'
    ],
    tags: ['Fintech', 'Telebirr', 'EthSwitch', 'Digital Payments', 'Ethiopia'],
    savedAt: '2026-08-22T08:00:00Z'
  }
];

const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: 'idea-1',
    userId: DEFAULT_USER_ID,
    title: 'AI-Powered Equb Risk & Yield Optimizer',
    description: 'An algorithm that simulates payout schedules, assesses member liquidity probability, and calculates equivalent annual percentage yields (APY) compared to Ethiopian treasury bills.',
    status: 'developing',
    category: 'Fintech Innovation',
    tags: ['Equb', 'AI', 'Fintech', 'ETB', 'Algorithms'],
    createdAt: '2026-08-30T15:45:00Z'
  },
  {
    id: 'idea-2',
    userId: DEFAULT_USER_ID,
    title: 'Bilingual (Amharic/English) Personal Tax Calculator',
    description: 'Lightweight offline-first web tool to calculate Ethiopian employment income tax, business profit tax brackets, and pension deductions with instant breakdown charts.',
    status: 'actionable',
    category: 'Productivity Tools',
    tags: ['Tax', 'Amharic', 'ETB', 'Calculator', 'Web'],
    createdAt: '2026-09-01T11:20:00Z'
  }
];

class KnowledgeStore {
  private notes: Map<string, NoteItem> = new Map();
  private documents: Map<string, DocumentItem> = new Map();
  private bookNotes: Map<string, BookNoteItem> = new Map();
  private articles: Map<string, SavedArticleItem> = new Map();
  private ideas: Map<string, IdeaItem> = new Map();

  constructor() {
    INITIAL_NOTES.forEach(n => this.notes.set(n.id, { ...n }));
    INITIAL_DOCUMENTS.forEach(d => this.documents.set(d.id, { ...d }));
    INITIAL_BOOK_NOTES.forEach(b => this.bookNotes.set(b.id, { ...b }));
    INITIAL_SAVED_ARTICLES.forEach(a => this.articles.set(a.id, { ...a }));
    INITIAL_IDEAS.forEach(i => this.ideas.set(i.id, { ...i }));
  }

  getNotes(userId = DEFAULT_USER_ID): NoteItem[] {
    return Array.from(this.notes.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getNoteById(id: string, userId = DEFAULT_USER_ID): NoteItem | undefined {
    const note = this.notes.get(id);
    return note && note.userId === userId ? note : undefined;
  }

  saveNote(note: Partial<NoteItem> & { title: string; content: string }, userId = DEFAULT_USER_ID): NoteItem {
    const now = new Date().toISOString();
    const id = note.id || ('note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
    const words = note.content.trim().split(/\s+/).filter(Boolean).length;
    const existing = this.notes.get(id);
    const updated: NoteItem = {
      id,
      userId: existing?.userId || userId,
      title: note.title,
      content: note.content,
      folder: note.folder || existing?.folder || 'General',
      tags: note.tags || existing?.tags || [],
      isFavorite: note.isFavorite !== undefined ? note.isFavorite : (existing?.isFavorite || false),
      isPinned: note.isPinned !== undefined ? note.isPinned : (existing?.isPinned || false),
      attachments: note.attachments || existing?.attachments || [],
      wordCount: words,
      readingTimeMinutes: Math.max(1, Math.ceil(words / 150)),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    this.notes.set(id, updated);
    return updated;
  }

  deleteNote(id: string, userId = DEFAULT_USER_ID): boolean {
    const note = this.notes.get(id);
    if (note && note.userId === userId) {
      return this.notes.delete(id);
    }
    return false;
  }

  getDocuments(userId = DEFAULT_USER_ID): DocumentItem[] {
    return Array.from(this.documents.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  getDocumentById(id: string, userId = DEFAULT_USER_ID): DocumentItem | undefined {
    const doc = this.documents.get(id);
    return doc && doc.userId === userId ? doc : undefined;
  }

  saveDocument(doc: Partial<DocumentItem> & { title: string; fileName: string; fileSize: number }, userId = DEFAULT_USER_ID): DocumentItem {
    const now = new Date().toISOString();
    const id = doc.id || ('doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
    const existing = this.documents.get(id);
    const ext = doc.fileName.split('.').pop()?.toLowerCase() || '';
    let fileType: DocumentItem['fileType'] = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'xlsx';
    else if (['txt', 'md'].includes(ext)) fileType = 'txt';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) fileType = 'image';

    const saved: DocumentItem = {
      id,
      userId: existing?.userId || userId,
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType || fileType,
      mimeType: doc.mimeType || (fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
      storageUrl: doc.storageUrl || ('/storage/docs/' + doc.fileName),
      folder: doc.folder || existing?.folder || 'General Documents',
      category: doc.category || existing?.category || 'General',
      tags: doc.tags || existing?.tags || [],
      description: doc.description || existing?.description || '',
      previewText: doc.previewText || existing?.previewText || 'No text preview available.',
      uploadedAt: existing?.uploadedAt || now,
      updatedAt: now,
      isEncrypted: doc.isEncrypted !== undefined ? doc.isEncrypted : (existing?.isEncrypted || false),
    };
    this.documents.set(id, saved);
    return saved;
  }

  deleteDocument(id: string, userId = DEFAULT_USER_ID): boolean {
    const doc = this.documents.get(id);
    if (doc && doc.userId === userId) {
      return this.documents.delete(id);
    }
    return false;
  }

  getAllKnowledgeItems(userId = DEFAULT_USER_ID): KnowledgeItem[] {
    const items: KnowledgeItem[] = [];
    for (const note of this.getNotes(userId)) {
      const fullText = `${note.title} ${note.content} ${note.folder} ${note.tags.join(' ')}`;
      items.push({
        id: note.id,
        userId: note.userId,
        type: 'note',
        title: note.title,
        excerpt: note.content.slice(0, 160).replace(/[#*_`]/g, '').trim() + (note.content.length > 160 ? '...' : ''),
        content: note.content,
        folder: note.folder,
        tags: note.tags,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        metadata: { wordCount: note.wordCount, attachmentsCount: note.attachments.length },
        embedding: generateSemanticVector(fullText),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    }
    for (const doc of this.getDocuments(userId)) {
      const fullText = `${doc.title} ${doc.description || ''} ${doc.previewText || ''} ${doc.folder} ${doc.tags.join(' ')}`;
      items.push({
        id: doc.id,
        userId: doc.userId,
        type: 'document',
        title: doc.title,
        excerpt: doc.description || doc.previewText?.slice(0, 160) || 'Uploaded Document',
        content: `${doc.title}\n\n${doc.description || ''}\n\nPreview:\n${doc.previewText || ''}`,
        folder: doc.folder,
        tags: doc.tags,
        isPinned: false,
        isFavorite: false,
        sourceUrl: doc.storageUrl,
        metadata: { fileName: doc.fileName, fileSize: doc.fileSize, fileType: doc.fileType, isEncrypted: doc.isEncrypted },
        embedding: generateSemanticVector(fullText),
        createdAt: doc.uploadedAt,
        updatedAt: doc.updatedAt,
      });
    }
    for (const bn of this.bookNotes.values()) {
      if (bn.userId === userId) {
        const fullText = `${bn.bookTitle} ${bn.author} ${bn.quote || ''} ${bn.reflection} ${bn.tags.join(' ')}`;
        items.push({
          id: bn.id,
          userId: bn.userId,
          type: 'book_note',
          title: `${bn.bookTitle} - ${bn.author}`,
          excerpt: bn.quote ? `"${bn.quote.slice(0, 120)}..."` : bn.reflection.slice(0, 120),
          content: `### ${bn.bookTitle} by ${bn.author}\n\n> "${bn.quote || ''}"\n\n**Reflection**: ${bn.reflection}`,
          tags: bn.tags,
          metadata: { author: bn.author, chapter: bn.chapter, page: bn.page },
          embedding: generateSemanticVector(fullText),
          createdAt: bn.createdAt,
          updatedAt: bn.createdAt,
        });
      }
    }
    for (const art of this.articles.values()) {
      if (art.userId === userId) {
        const fullText = `${art.title} ${art.summary} ${art.keyTakeaways.join(' ')} ${art.tags.join(' ')}`;
        items.push({
          id: art.id,
          userId: art.userId,
          type: 'saved_article',
          title: art.title,
          excerpt: art.summary.slice(0, 160),
          content: `## ${art.title}\nSource: [${art.source}](${art.url})\n\n${art.summary}\n\n### Key Takeaways:\n${art.keyTakeaways.map(t => `- ${t}`).join('\n')}`,
          tags: art.tags,
          sourceUrl: art.url,
          metadata: { source: art.source, takeaways: art.keyTakeaways },
          embedding: generateSemanticVector(fullText),
          createdAt: art.savedAt,
          updatedAt: art.savedAt,
        });
      }
    }
    for (const idea of this.ideas.values()) {
      if (idea.userId === userId) {
        const fullText = `${idea.title} ${idea.description} ${idea.category} ${idea.tags.join(' ')}`;
        items.push({
          id: idea.id,
          userId: idea.userId,
          type: 'idea',
          title: idea.title,
          excerpt: idea.description.slice(0, 160),
          content: `# ${idea.title}\nStatus: ${idea.status.toUpperCase()}\nCategory: ${idea.category}\n\n${idea.description}`,
          folder: idea.category,
          tags: idea.tags,
          metadata: { status: idea.status, category: idea.category },
          embedding: generateSemanticVector(fullText),
          createdAt: idea.createdAt,
          updatedAt: idea.createdAt,
        });
      }
    }
    return items;
  }

  search(options: SearchOptions, userId = DEFAULT_USER_ID): SearchResultItem[] {
    const { query, type = 'all', folder, tag, limit = 20, semanticThreshold = 0.25 } = options;
    const cleanQuery = query.trim().toLowerCase();
    const queryVector = cleanQuery ? generateSemanticVector(cleanQuery) : [];
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
    const allItems = this.getAllKnowledgeItems(userId);
    const scoredResults: SearchResultItem[] = [];

    for (const item of allItems) {
      if (type !== 'all' && item.type !== type) continue;
      if (folder && item.folder?.toLowerCase() !== folder.toLowerCase()) continue;
      if (tag && !item.tags.some(t => t.toLowerCase() === tag.toLowerCase())) continue;

      if (!cleanQuery) {
        scoredResults.push({ item, score: 100, matchType: 'keyword_content', highlights: [] });
        continue;
      }

      let exactScore = 0;
      let tokenScore = 0;
      let tagScore = 0;
      let vectorScore = 0;
      const highlights: string[] = [];
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content.toLowerCase();

      if (titleLower.includes(cleanQuery)) {
        exactScore = 60;
        highlights.push(`Title match: ${item.title}`);
      }

      let tokensMatched = 0;
      for (const token of queryTokens) {
        if (titleLower.includes(token) || contentLower.includes(token)) {
          tokensMatched++;
        }
      }
      if (tokensMatched > 0) {
        tokenScore = (tokensMatched / queryTokens.length) * 40;
      }

      const tagOverlap = item.tags.filter(t => queryTokens.some(tok => t.toLowerCase().includes(tok)));
      if (tagOverlap.length > 0) {
        tagScore = tagOverlap.length * 15;
        highlights.push(`Tags: ${tagOverlap.join(', ')}`);
      }

      if (item.embedding && queryVector.length > 0) {
        const sim = cosineSimilarity(queryVector, item.embedding);
        if (sim >= semanticThreshold) {
          vectorScore = sim * 50;
        }
      }

      const totalScore = Math.min(100, Math.round(exactScore + tokenScore + tagScore + vectorScore));
      if (totalScore > 10) {
        let matchType: SearchResultItem['matchType'] = 'hybrid';
        if (exactScore > 0 && tokenScore === 0 && vectorScore === 0) matchType = 'exact_title';
        else if (tagScore > 0 && exactScore === 0 && vectorScore === 0) matchType = 'tag_match';
        else if (vectorScore > 30 && tokenScore < 10) matchType = 'semantic_vector';

        scoredResults.push({
          item,
          score: totalScore,
          matchType,
          highlights: highlights.length > 0 ? highlights : [item.excerpt]
        });
      }
    }

    return scoredResults
      .sort((a, b) => b.score - a.score || new Date(b.item.updatedAt).getTime() - new Date(a.item.updatedAt).getTime())
      .slice(0, limit);
  }

  getRelatedItems(itemId: string, userId = DEFAULT_USER_ID, limit = 4): RelatedItemMatch[] {
    const allItems = this.getAllKnowledgeItems(userId);
    const targetItem = allItems.find(i => i.id === itemId);
    if (!targetItem) return [];
    const matches: RelatedItemMatch[] = [];

    for (const item of allItems) {
      if (item.id === targetItem.id) continue;
      const commonTags = item.tags.filter(t => targetItem.tags.some(tgt => tgt.toLowerCase() === t.toLowerCase()));
      let sim = 0;
      if (targetItem.embedding && item.embedding) {
        sim = cosineSimilarity(targetItem.embedding, item.embedding);
      }
      const sameFolder = targetItem.folder && item.folder && targetItem.folder === item.folder;
      const similarityScore = Number((sim * 0.5 + (commonTags.length * 0.15) + (sameFolder ? 0.2 : 0)).toFixed(2));

      if (similarityScore > 0.15 || commonTags.length > 0) {
        let reason = 'Semantic relevance';
        if (commonTags.length > 0) {
          reason = `Shared topics: ${commonTags.join(', ')}`;
        } else if (sameFolder) {
          reason = `Same folder: ${item.folder}`;
        }
        matches.push({
          item,
          similarityScore: Math.min(1.0, similarityScore),
          commonTags,
          relationshipReason: reason
        });
      }
    }
    return matches.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
  }

  getStats(userId = DEFAULT_USER_ID): KnowledgeStats {
    const notes = this.getNotes(userId);
    const docs = this.getDocuments(userId);
    const bookNotes = Array.from(this.bookNotes.values()).filter(b => b.userId === userId);
    const articles = Array.from(this.articles.values()).filter(a => a.userId === userId);
    const ideas = Array.from(this.ideas.values()).filter(i => i.userId === userId);

    const totalStorageBytes = docs.reduce((sum, d) => sum + d.fileSize, 0) +
      notes.reduce((sum, n) => sum + n.attachments.reduce((aSum, a) => aSum + a.size, 0), 0);

    const tagCounts = new Map<string, number>();
    const folderSet = new Set<string>();

    [...notes, ...docs, ...bookNotes, ...articles, ...ideas].forEach(item => {
      item.tags.forEach(t => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
      if ('folder' in item && item.folder) folderSet.add(item.folder as string);
    });

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalItems: notes.length + docs.length + bookNotes.length + articles.length + ideas.length,
      notesCount: notes.length,
      documentsCount: docs.length,
      bookNotesCount: bookNotes.length,
      savedArticlesCount: articles.length,
      ideasCount: ideas.length,
      totalStorageBytes,
      topTags,
      folders: Array.from(folderSet)
    };
  }

  saveIdea(idea: Partial<IdeaItem> & { title: string; description: string }, userId = DEFAULT_USER_ID): IdeaItem {
    const id = idea.id || ('idea-' + Date.now());
    const item: IdeaItem = {
      id,
      userId,
      title: idea.title,
      description: idea.description,
      status: idea.status || 'raw',
      category: idea.category || 'General',
      tags: idea.tags || [],
      createdAt: new Date().toISOString()
    };
    this.ideas.set(id, item);
    return item;
  }
}

export const knowledgeEngine = new KnowledgeStore();