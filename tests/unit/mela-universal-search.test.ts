import { describe, it, expect } from 'vitest';
import { universalSearchEngine, DefaultSemanticProvider } from '@/lib/search/universal-search';

describe('MELA Universal Search Engine', () => {
  const TEST_USER = 'user-ethiopia-01';

  it('should calculate semantic relevance scores and extract keywords', () => {
    const provider = new DefaultSemanticProvider();
    const score = provider.calculateScore('laptop', 'Laptop repair and screen replacement', ['Hardware']);
    expect(score).toBeGreaterThan(50);

    const unrelated = provider.calculateScore('astronomy', 'Teff purchase in Merkato');
    expect(unrelated).toBeLessThan(20);
  });

  it('should search across multiple domains and group results with domain badges', () => {
    const results = universalSearchEngine.search({
      query: 'laptop',
      domain: 'all'
    }, TEST_USER);

    expect(results.query).toBe('laptop');
    expect(results.totalResults).toBeGreaterThan(0);
    expect(results.groups.length).toBeGreaterThan(0);

    const domainNames = results.groups.map(g => g.domain);
    expect(domainNames.some(d => ['expenses', 'goals', 'notes', 'documents', 'tasks'].includes(d))).toBe(true);
  });

  it('should support domain-specific filtering', () => {
    const expenseOnly = universalSearchEngine.search({
      query: 'Ethiopia',
      domain: 'expenses'
    }, TEST_USER);

    expect(expenseOnly.groups.every(g => g.domain === 'expenses')).toBe(true);

    const notesOnly = universalSearchEngine.search({
      query: 'Equb',
      domain: 'notes'
    }, TEST_USER);

    expect(notesOnly.groups.every(g => g.domain === 'notes')).toBe(true);
  });

  it('should provide suggested search inquiries', () => {
    const results = universalSearchEngine.search({
      query: ''
    }, TEST_USER);

    expect(results.suggestedQueries.length).toBeGreaterThan(0);
  });
});