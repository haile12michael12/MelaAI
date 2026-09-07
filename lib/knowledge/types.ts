export type KnowledgeType = 'note' | 'document' | 'book_note' | 'saved_article' | 'idea';

export interface Attachment {
  id: string;
  name: string;
  size: number; // bytes
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  attachments: Attachment[];
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'image' | 'other';
  mimeType: string;
  storageUrl: string;
  folder: string;
  category: string;
  tags: string[];
  description?: string;
  previewText?: string;
  uploadedAt: string;
  updatedAt: string;
  isEncrypted?: boolean;
}

export interface BookNoteItem {
  id: string;
  userId: string;
  bookTitle: string;
  author: string;
  chapter?: string;
  page?: number;
  quote?: string;
  reflection: string;
  tags: string[];
  createdAt: string;
}

export interface SavedArticleItem {
  id: string;
  userId: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  keyTakeaways: string[];
  tags: string[];
  savedAt: string;
}

export interface IdeaItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'raw' | 'developing' | 'actionable' | 'archived';
  category: string;
  tags: string[];
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  userId: string;
  type: KnowledgeType;
  title: string;
  excerpt: string;
  content: string;
  folder?: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  sourceUrl?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchOptions {
  query: string;
  type?: KnowledgeType | 'all';
  folder?: string;
  tag?: string;
  limit?: number;
  semanticThreshold?: number;
}

export interface SearchResultItem {
  item: KnowledgeItem;
  score: number;
  matchType: 'exact_title' | 'keyword_content' | 'tag_match' | 'semantic_vector' | 'hybrid';
  highlights: string[];
}

export interface RelatedItemMatch {
  item: KnowledgeItem;
  similarityScore: number;
  commonTags: string[];
  relationshipReason: string;
}

export interface KnowledgeStats {
  totalItems: number;
  notesCount: number;
  documentsCount: number;
  bookNotesCount: number;
  savedArticlesCount: number;
  ideasCount: number;
  totalStorageBytes: number;
  topTags: { tag: string; count: number }[];
  folders: string[];
}