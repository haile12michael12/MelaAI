import { describe, it, expect } from 'vitest';
import { knowledgeEngine, generateSemanticVector, cosineSimilarity } from '@/lib/knowledge/engine';

describe('MELA Knowledge & Semantic Search Engine', () => {
  const TEST_USER = 'user-ethiopia-01';

  it('should initialize with seed notes and documents scoped to authenticated user', () => {
    const notes = knowledgeEngine.getNotes(TEST_USER);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0].userId).toBe(TEST_USER);

    const docs = knowledgeEngine.getDocuments(TEST_USER);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0].userId).toBe(TEST_USER);
  });

  it('should support Note CRUD operations with user scoping and tag indexing', () => {
    const newNote = knowledgeEngine.saveNote({
      title: 'Coffee Export Strategy 2026',
      content: '# Export Strategy\nTargeting European buyers for Grade 1 Sidama beans.',
      folder: 'Business & Ventures',
      tags: ['Coffee', 'Sidama', 'Export', 'Trade'],
      isFavorite: true,
      isPinned: true
    }, TEST_USER);

    expect(newNote.id).toBeDefined();
    expect(newNote.wordCount).toBeGreaterThan(0);

    const fetched = knowledgeEngine.getNoteById(newNote.id, TEST_USER);
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe('Coffee Export Strategy 2026');

    const deleted = knowledgeEngine.deleteNote(newNote.id, TEST_USER);
    expect(deleted).toBe(true);
    expect(knowledgeEngine.getNoteById(newNote.id, TEST_USER)).toBeUndefined();
  });

  it('should support Document Vault metadata indexing and deletion', () => {
    const newDoc = knowledgeEngine.saveDocument({
      title: 'Tax Clearance Certificate 2026',
      fileName: 'tax_clearance_2026.pdf',
      fileSize: 1024000,
      category: 'Legal & Tax',
      tags: ['Tax', 'ERCA', 'Clearance'],
      description: 'Official annual tax clearance document.',
      previewText: 'Ministry of Revenue Tax Clearance for FY2025/2026...'
    }, TEST_USER);

    expect(newDoc.fileType).toBe('pdf');
    expect(newDoc.isEncrypted).toBe(false);

    const docs = knowledgeEngine.getDocuments(TEST_USER);
    expect(docs.some(d => d.id === newDoc.id)).toBe(true);

    knowledgeEngine.deleteDocument(newDoc.id, TEST_USER);
  });

  it('should compute deterministic normalized semantic embedding vectors and cosine similarity', () => {
    const vec1 = generateSemanticVector('coffee export logistics trade');
    const vec2 = generateSemanticVector('coffee export trade shipping');
    const vec3 = generateSemanticVector('quantum physics astrophysics relativity');

    expect(vec1.length).toBe(32);
    expect(vec2.length).toBe(32);

    const simRelated = cosineSimilarity(vec1, vec2);
    const simUnrelated = cosineSimilarity(vec1, vec3);

    expect(simRelated).toBeGreaterThan(simUnrelated);
  });

  it('should perform unified search across Notes, Documents, and Articles with score ranking', () => {
    const searchResults = knowledgeEngine.search({
      query: 'Equb',
      type: 'all'
    }, TEST_USER);

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].score).toBeGreaterThan(20);
    expect(searchResults[0].item.title.toLowerCase()).toContain('equb');
  });

  it('should discover related knowledge items based on tag overlap and semantic vectors', () => {
    const notes = knowledgeEngine.getNotes(TEST_USER);
    const note1 = notes[0];

    const related = knowledgeEngine.getRelatedItems(note1.id, TEST_USER, 3);
    expect(Array.isArray(related)).toBe(true);
  });

  it('should compute accurate knowledge statistics', () => {
    const stats = knowledgeEngine.getStats(TEST_USER);
    expect(stats.totalItems).toBeGreaterThan(0);
    expect(stats.notesCount).toBeGreaterThan(0);
    expect(stats.documentsCount).toBeGreaterThan(0);
    expect(stats.topTags.length).toBeGreaterThan(0);
  });
});