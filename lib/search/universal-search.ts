import { knowledgeEngine } from '@/lib/knowledge/engine';
import { habitsIntelligence } from '@/lib/habits/intelligence';
import { goalsIntelligence } from '@/lib/goals/intelligence';

export type SearchDomain =
  | 'expenses'
  | 'investments'
  | 'goals'
  | 'tasks'
  | 'habits'
  | 'books'
  | 'media'
  | 'subscriptions'
  | 'notes'
  | 'documents'
  | 'navigation';

export interface UniversalSearchItem {
  id: string;
  title: string;
  subtitle: string;
  domain: SearchDomain;
  href: string;
  score: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface DomainGroup {
  domain: SearchDomain;
  label: string;
  icon: string;
  items: UniversalSearchItem[];
}

export interface UniversalSearchOptions {
  query: string;
  domain?: SearchDomain | 'all';
  limit?: number;
}

export interface UniversalSearchResult {
  query: string;
  totalResults: number;
  groups: DomainGroup[];
  suggestedQueries: string[];
}

export interface SemanticSearchProvider {
  calculateScore(query: string, text: string, tags?: string[]): number;
  extractKeywords(text: string): string[];
}

export class DefaultSemanticProvider implements SemanticSearchProvider {
  extractKeywords(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\u1200-\u137F\s]/g, '').split(/\s+/).filter(Boolean);
  }

  calculateScore(query: string, text: string, tags: string[] = []): number {
    const cleanQ = query.trim().toLowerCase();
    const cleanText = text.toLowerCase();
    if (!cleanQ) return 100;

    let score = 0;
    if (cleanText.includes(cleanQ)) score += 50;

    const qTokens = this.extractKeywords(cleanQ);
    const textTokens = this.extractKeywords(cleanText);

    let matchedTokens = 0;
    for (const token of qTokens) {
      if (textTokens.some(t => t.includes(token) || token.includes(t))) {
        matchedTokens++;
      }
      if (tags.some(t => t.toLowerCase().includes(token))) {
        score += 25;
      }
    }

    if (qTokens.length > 0) {
      score += Math.round((matchedTokens / qTokens.length) * 40);
    }

    return Math.min(100, score);
  }
}

const MOCK_EXPENSES = [
  { id: 'exp-1', title: 'Laptop repair & battery replacement', category: 'Electronics', amount: 2500, date: '2026-09-02', notes: 'Bole computer center screen and battery check' },
  { id: 'exp-2', title: 'Monthly Grocery & Teff Purchase', category: 'Food & Dining', amount: 8500, date: '2026-09-01', notes: 'Magna Teff 100kg from Merkato' },
  { id: 'exp-3', title: 'Addis Ababa Office Internet (Ethio Telecom)', category: 'Utilities', amount: 3200, date: '2026-08-28', notes: 'Broadband optical fiber connection' },
  { id: 'exp-4', title: 'Fuel for Toyota Hilux', category: 'Transportation', amount: 4600, date: '2026-09-05', notes: 'NOC Station Bole Road' },
  { id: 'exp-5', title: 'Commercial Lease Deposit', category: 'Housing & Rent', amount: 65000, date: '2026-08-15', notes: 'Quarterly office lease Bole Medhanialem' }
];

const MOCK_INVESTMENTS = [
  { id: 'inv-1', name: 'Ethiopian Sovereign T-Bills 364D', category: 'Fixed Income', amount: 150000, yield: '14.5% APY', notes: 'National Bank of Ethiopia auctioned treasury bills' },
  { id: 'inv-2', name: 'Commercial Bank of Ethiopia Share Equity', category: 'Local Equities', amount: 85000, yield: '+18% Div', notes: 'CBE private equity allotment' },
  { id: 'inv-3', name: 'Physical Gold Holdings (24K Bullion)', category: 'Commodities', amount: 240000, yield: 'Hedge', notes: 'National Mining Corp certified gold bars' },
  { id: 'inv-4', name: 'Bitcoin (BTC) Cold Storage', category: 'Crypto', amount: 180000, yield: 'Long Term', notes: 'Hardware wallet multi-sig' },
  { id: 'inv-5', name: 'Specialty Coffee Farm Partnership (Yirgacheffe)', category: 'Direct Venture', amount: 320000, yield: 'Export ROI', notes: 'Organic Arabica coffee washing station' }
];

const MOCK_TASKS = [
  { id: 'task-1', title: 'Review Laptop warranty & export invoice', priority: 'High', dueDate: '2026-09-10', project: 'Procurement', status: 'pending' },
  { id: 'task-2', title: 'File monthly VAT return with ERCA', priority: 'High', dueDate: '2026-09-15', project: 'Finance & Tax', status: 'pending' },
  { id: 'task-3', title: 'Transfer monthly Equb contribution (12,000 ETB)', priority: 'Medium', dueDate: '2026-09-08', project: 'Community', status: 'in_progress' },
  { id: 'task-4', title: 'Inspect Sidama coffee cupping sample Grade 1', priority: 'Medium', dueDate: '2026-09-12', project: 'Trade', status: 'pending' }
];

const MOCK_BOOKS = [
  { id: 'book-1', title: 'The Psychology of Money', author: 'Morgan Housel', progress: '85%', rating: 5, notes: 'Freedom and wealth mindset notes' },
  { id: 'book-2', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', progress: '60%', rating: 5, notes: 'System 1 and System 2 decision biases' },
  { id: 'book-3', title: 'Principles: Life and Work', author: 'Ray Dalio', progress: '40%', rating: 4, notes: 'Radical transparency and portfolio diversification' },
  { id: 'book-4', title: 'Shoe Dog (Ethiopian Edition)', author: 'Phil Knight', progress: '100%', rating: 5, notes: 'Entrepreneurial grit and global manufacturing' }
];

const MOCK_MEDIA = [
  { id: 'med-1', title: 'Silicon Valley: The Untold Stories', type: 'Docuseries', status: 'Watching', progress: 'S2 E4' },
  { id: 'med-2', title: 'Oppenheimer', type: 'Movie', status: 'Completed', progress: '180m' },
  { id: 'med-3', title: 'Attack on Titan: Final Season', type: 'Anime', status: 'Completed', progress: 'Complete' },
  { id: 'med-4', title: 'Bloomberg Originals: The Future of African Fintech', type: 'Documentary', status: 'Plan to Watch', progress: '45m' }
];

const MOCK_SUBSCRIPTIONS = [
  { id: 'sub-1', name: 'Ethio Telecom 4G/5G Unlimited Business', cost: 1800, billingCycle: 'monthly', renewDate: '2026-09-15' },
  { id: 'sub-2', name: 'ChatGPT Plus & API Credits', cost: 2400, billingCycle: 'monthly', renewDate: '2026-09-20' },
  { id: 'sub-3', name: 'GitHub Copilot Enterprise', cost: 2300, billingCycle: 'monthly', renewDate: '2026-09-28' },
  { id: 'sub-4', name: 'Bloomberg Terminal Lite', cost: 4500, billingCycle: 'monthly', renewDate: '2026-10-01' }
];

const NAVIGATION_PAGES = [
  { title: 'Dashboard', subtitle: 'Personal Operating System Overview', href: '/dashboard', keywords: ['home', 'kpi', 'metrics', 'overview'] },
  { title: 'Finance Intelligence', subtitle: 'Deterministic spending analysis & cash flow', href: '/mela/finance', keywords: ['money', 'expenses', 'budget', 'ledger', 'etb', 'birr'] },
  { title: 'Net Worth Sheet', subtitle: 'Balance sheet, assets vs liabilities', href: '/net-worth', keywords: ['wealth', 'balance', 'assets', 'liabilities'] },
  { title: 'Goals & Targets', subtitle: 'Required contributions & completion projections', href: '/goals', keywords: ['targets', 'savings', 'laptop', 'milestones'] },
  { title: 'Productivity Planner', subtitle: 'Unified tasks and Ethiopian calendar', href: '/tasks', keywords: ['todo', 'schedule', 'agenda', 'calendar'] },
  { title: 'Habit Tracker', subtitle: 'Streaks, heatmaps and routines', href: '/habits', keywords: ['streaks', 'routines', 'consistency'] },
  { title: 'Knowledge Base', subtitle: 'Unified hybrid semantic search and idea capture', href: '/knowledge', keywords: ['semantic', 'research', 'graph', 'ideas'] },
  { title: 'Notes Workspace', subtitle: 'Markdown editor, folders and tag clouds', href: '/notes', keywords: ['markdown', 'editor', 'scratchpad'] },
  { title: 'Document Vault', subtitle: 'Secure storage for contracts and tax filings', href: '/documents', keywords: ['vault', 'contracts', 'pdf', 'files'] },
  { title: 'MELA AI Assistant', subtitle: 'Interactive intelligent companion & tool caller', href: '/mela/assistant', keywords: ['chat', 'assistant', 'ask mela'] },
];

export class UniversalSearchEngine {
  private semanticProvider: SemanticSearchProvider;

  constructor(provider?: SemanticSearchProvider) {
    this.semanticProvider = provider || new DefaultSemanticProvider();
  }

  public search(options: UniversalSearchOptions, userId = 'user-ethiopia-01'): UniversalSearchResult {
    const { query, domain = 'all', limit = 25 } = options;
    const cleanQ = query.trim();

    const domainResults: Record<SearchDomain, UniversalSearchItem[]> = {
      expenses: [],
      investments: [],
      goals: [],
      tasks: [],
      habits: [],
      books: [],
      media: [],
      subscriptions: [],
      notes: [],
      documents: [],
      navigation: []
    };

    if (domain === 'all' || domain === 'navigation') {
      for (const nav of NAVIGATION_PAGES) {
        const full = `${nav.title} ${nav.subtitle} ${nav.keywords.join(' ')}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, nav.keywords);
        if (score > 15 || !cleanQ) {
          domainResults.navigation.push({
            id: `nav-${nav.href}`,
            title: nav.title,
            subtitle: nav.subtitle,
            domain: 'navigation',
            href: nav.href,
            score,
            tags: nav.keywords
          });
        }
      }
    }

    if (domain === 'all' || domain === 'expenses') {
      for (const exp of MOCK_EXPENSES) {
        const full = `${exp.title} ${exp.category} ${exp.notes}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [exp.category]);
        if (score > 15 || !cleanQ) {
          domainResults.expenses.push({
            id: exp.id,
            title: exp.title,
            subtitle: `${exp.category} — ${exp.amount.toLocaleString()} ETB`,
            domain: 'expenses',
            href: '/mela/finance',
            score,
            tags: [exp.category, 'ETB'],
            metadata: { amount: exp.amount, date: exp.date }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'investments') {
      for (const inv of MOCK_INVESTMENTS) {
        const full = `${inv.name} ${inv.category} ${inv.notes}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [inv.category]);
        if (score > 15 || !cleanQ) {
          domainResults.investments.push({
            id: inv.id,
            title: inv.name,
            subtitle: `${inv.category} — ${inv.amount.toLocaleString()} ETB (${inv.yield})`,
            domain: 'investments',
            href: '/net-worth',
            score,
            tags: [inv.category],
            metadata: { amount: inv.amount, yield: inv.yield }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'goals') {
      const goals = goalsIntelligence.getGoalsWithIntelligence(userId);
      for (const goal of goals) {
        const full = `${goal.title} ${goal.category} ${goal.notes || ''}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [goal.category]);
        if (score > 15 || !cleanQ) {
          domainResults.goals.push({
            id: goal.id,
            title: goal.title,
            subtitle: `${goal.category} — ${goal.progressPercent}% (${goal.currentAmount.toLocaleString()}/${goal.targetAmount.toLocaleString()} ETB)`,
            domain: 'goals',
            href: '/goals',
            score,
            tags: [goal.category],
            metadata: { progress: goal.progressPercent, target: goal.targetAmount }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'tasks') {
      for (const task of MOCK_TASKS) {
        const full = `${task.title} ${task.project} ${task.priority}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [task.project, task.priority]);
        if (score > 15 || !cleanQ) {
          domainResults.tasks.push({
            id: task.id,
            title: task.title,
            subtitle: `${task.project} • Priority: ${task.priority} • Due: ${task.dueDate}`,
            domain: 'tasks',
            href: '/tasks',
            score,
            tags: [task.priority, task.project],
            metadata: { dueDate: task.dueDate }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'habits') {
      const habits = habitsIntelligence.getHabitsWithStats(userId);
      for (const habit of habits) {
        const full = `${habit.title} ${habit.category} ${habit.description || ''}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [habit.category]);
        if (score > 15 || !cleanQ) {
          domainResults.habits.push({
            id: habit.id,
            title: habit.title,
            subtitle: `${habit.category} — ${habit.stats.currentStreak} day streak (Best: ${habit.stats.bestStreak}d)`,
            domain: 'habits',
            href: '/habits',
            score,
            tags: [habit.category],
            metadata: { streak: habit.stats.currentStreak }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'books') {
      for (const book of MOCK_BOOKS) {
        const full = `${book.title} ${book.author} ${book.notes}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [book.author]);
        if (score > 15 || !cleanQ) {
          domainResults.books.push({
            id: book.id,
            title: book.title,
            subtitle: `by ${book.author} — Progress: ${book.progress}`,
            domain: 'books',
            href: '/knowledge',
            score,
            tags: [book.author],
            metadata: { progress: book.progress }
          });
        }
      }
    }

    if (domain === 'all' || domain === 'media') {
      for (const media of MOCK_MEDIA) {
        const full = `${media.title} ${media.type} ${media.status}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [media.type]);
        if (score > 15 || !cleanQ) {
          domainResults.media.push({
            id: media.id,
            title: media.title,
            subtitle: `${media.type} • Status: ${media.status} (${media.progress})`,
            domain: 'media',
            href: '/knowledge',
            score,
            tags: [media.type, media.status]
          });
        }
      }
    }

    if (domain === 'all' || domain === 'subscriptions') {
      for (const sub of MOCK_SUBSCRIPTIONS) {
        const full = `${sub.name} ${sub.billingCycle}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, [sub.billingCycle]);
        if (score > 15 || !cleanQ) {
          domainResults.subscriptions.push({
            id: sub.id,
            title: sub.name,
            subtitle: `${sub.cost.toLocaleString()} ETB / ${sub.billingCycle} • Renews ${sub.renewDate}`,
            domain: 'subscriptions',
            href: '/mela/finance',
            score,
            tags: [sub.billingCycle]
          });
        }
      }
    }

    if (domain === 'all' || domain === 'notes') {
      const notes = knowledgeEngine.getNotes(userId);
      for (const note of notes) {
        const full = `${note.title} ${note.content} ${note.folder} ${note.tags.join(' ')}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, note.tags);
        if (score > 15 || !cleanQ) {
          const cleanSnippet = note.content.replace(/[^a-zA-Z0-9\u1200-\u137F\s]/g, '').slice(0, 60);
          domainResults.notes.push({
            id: note.id,
            title: note.title,
            subtitle: `${note.folder} — ${cleanSnippet}...`,
            domain: 'notes',
            href: '/notes',
            score,
            tags: note.tags
          });
        }
      }
    }

    if (domain === 'all' || domain === 'documents') {
      const docs = knowledgeEngine.getDocuments(userId);
      for (const doc of docs) {
        const full = `${doc.title} ${doc.fileName} ${doc.description || ''} ${doc.tags.join(' ')}`;
        const score = this.semanticProvider.calculateScore(cleanQ, full, doc.tags);
        if (score > 15 || !cleanQ) {
          domainResults.documents.push({
            id: doc.id,
            title: doc.title,
            subtitle: `${doc.fileName} • ${doc.category} (${(doc.fileSize / 1024).toFixed(1)} KB)`,
            domain: 'documents',
            href: '/documents',
            score,
            tags: doc.tags
          });
        }
      }
    }

    const domainMeta: { domain: SearchDomain; label: string; icon: string }[] = [
      { domain: 'expenses', label: 'Expenses (ወጪዎች)', icon: 'Receipt' },
      { domain: 'goals', label: 'Goals (ዕቅዶች)', icon: 'Target' },
      { domain: 'notes', label: 'Notes (ማስታወሻዎች)', icon: 'FileText' },
      { domain: 'documents', label: 'Documents (ሰነዶች)', icon: 'FolderLock' },
      { domain: 'tasks', label: 'Tasks (ተግባራት)', icon: 'CheckSquare' },
      { domain: 'habits', label: 'Habits (ልማዶች)', icon: 'Flame' },
      { domain: 'investments', label: 'Investments (ኢንቨስትመንት)', icon: 'TrendingUp' },
      { domain: 'subscriptions', label: 'Subscriptions (ምዝገባዎች)', icon: 'Repeat' },
      { domain: 'books', label: 'Books (መጽሐፍት)', icon: 'BookOpen' },
      { domain: 'media', label: 'Media (ሚዲያ)', icon: 'Film' },
      { domain: 'navigation', label: 'Navigation Pages', icon: 'Compass' }
    ];

    const groups: DomainGroup[] = [];
    let total = 0;

    for (const meta of domainMeta) {
      const items = domainResults[meta.domain].sort((a, b) => b.score - a.score);
      if (items.length > 0) {
        groups.push({
          domain: meta.domain,
          label: meta.label,
          icon: meta.icon,
          items: items.slice(0, 5)
        });
        total += items.length;
      }
    }

    const suggestedQueries = [
      'Laptop',
      'Equb savings',
      'Teff grocery',
      'Office lease',
      'T-Bills',
      'Habit routine',
      'Psychology of money'
    ];

    return {
      query,
      totalResults: total,
      groups,
      suggestedQueries
    };
  }
}

export const universalSearchEngine = new UniversalSearchEngine();