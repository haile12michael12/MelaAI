import { describe, it, expect } from 'vitest';
import {
  MelaFinanceIntelligence,
  formatCurrency,
  ETHIOPIAN_CATEGORIES,
  CURRENCY_SYMBOLS,
} from '../../lib/finance/intelligence';
import type { ExpenseRecord } from '@/lib/firebase';

describe('MelaFinanceIntelligence Service', () => {
  const mockExpenses: ExpenseRecord[] = [
    { id: '1', date: '2026-08-01', amount: 300, title: 'Teff Market', category: 'Food & Teff (ምግብ / ጤፍ)' },
    { id: '2', date: '2026-08-10', amount: 150, title: 'Ride Addis', category: 'Transport & Ride (ትራንስፖርት / ራይድ)' },
    { id: '3', date: '2026-08-15', amount: 500, title: 'Monthly Equb', category: 'Equb (እቁብ)' },
    { id: '4', date: '2026-08-20', amount: 100, title: 'Ethio Telecom Package', category: 'Utilities & Tele (መብራት / ውሃ / ቴሌ)' },
    { id: '5', date: '2026-08-25', amount: 300, title: 'Teff Market', category: 'Food & Teff (ምግብ / ጤፍ)' },
    { id: '6', date: '2026-07-05', amount: 450, title: 'Supermarket Teff', category: 'Food & Teff (ምግብ / ጤፍ)' },
    { id: '7', date: '2026-07-15', amount: 500, title: 'Monthly Equb', category: 'Equb (እቁብ)' },
  ];

  it('calculates deterministic spending analysis', () => {
    const spending = MelaFinanceIntelligence.analyzeSpending(mockExpenses, 30);
    expect(spending.totalOutflow).toBe(2300);
    expect(spending.transactionCount).toBe(7);
    expect(spending.largestExpense?.amount).toBe(500);
    expect(spending.dailyAverage).toBeCloseTo(2300 / 30, 2);
  });

  it('calculates deterministic income and savings analysis', () => {
    const income = MelaFinanceIntelligence.analyzeIncome(mockExpenses, 5000);
    expect(income.totalInflow).toBe(5000);
    expect(income.netCashflow).toBe(2700);

    const savings = MelaFinanceIntelligence.analyzeSavings(income.totalInflow, 2300, 10000);
    expect(savings.savingsAmount).toBe(2700);
    expect(savings.savingsRate).toBe(54);
    expect(savings.rating).toBe('Excellent');
    expect(savings.emergencyRunwayMonths).toBeGreaterThan(4);
  });

  it('breaks down categories with Ethiopian category matching', () => {
    const categories = MelaFinanceIntelligence.analyzeCategories(mockExpenses);
    expect(categories.length).toBeGreaterThanOrEqual(4);

    const equb = categories.find((c) => c.category.includes('Equb'));
    expect(equb).toBeDefined();
    expect(equb?.total).toBe(1000);
  });

  it('analyzes top merchants', () => {
    const merchants = MelaFinanceIntelligence.analyzeMerchants(mockExpenses);
    expect(merchants.length).toBeGreaterThan(0);
    const teff = merchants.find((m) => m.merchant.includes('Teff'));
    expect(teff).toBeDefined();
  });

  it('compares two distinct months deterministically', () => {
    const comparison = MelaFinanceIntelligence.compareMonths(mockExpenses, '2026-08', '2026-07');
    expect(comparison.monthA.month).toBe('2026-08');
    expect(comparison.monthB.month).toBe('2026-07');
    expect(comparison.monthA.total).toBe(1350);
    expect(comparison.monthB.total).toBe(950);
    expect(comparison.diff).toBe(400);
    expect(comparison.isHigher).toBe(true);
  });

  it('detects recurring expenses across transactions', () => {
    const recurring = MelaFinanceIntelligence.detectRecurringExpenses(mockExpenses);
    expect(recurring.length).toBeGreaterThanOrEqual(2);
    const hasEqub = recurring.some((r) => r.title.includes('equb'));
    expect(hasEqub).toBe(true);
  });

  it('calculates financial health score bounded between 0 and 100', () => {
    const score = MelaFinanceIntelligence.calculateHealthScore(5000, 2300, 0, 4);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(['A+', 'A', 'B', 'C', 'D']).toContain(score.grade);
    expect(score.keyInsights.length).toBeGreaterThan(0);
  });

  it('evaluates natural language financial questions deterministically', () => {
    // 1. Food category
    const q1 = MelaFinanceIntelligence.answerQuestion('How much did I spend on food?', mockExpenses, 5000, 'ETB');
    expect(q1.answer).toContain('Food & Teff');

    // 2. Month comparison
    const q2 = MelaFinanceIntelligence.answerQuestion('Compare August and July', mockExpenses, 5000, 'ETB');
    expect(q2.answer).toContain('2026-08');
    expect(q2.answer).toContain('2026-07');

    // 3. Overspending
    const q3 = MelaFinanceIntelligence.answerQuestion('Where am I overspending?', mockExpenses, 5000, 'ETB');
    expect(q3.answer).toContain('largest spending outflows');

    // 4. Affordability
    const q4 = MelaFinanceIntelligence.answerQuestion('Can I afford this purchase of 500 ETB?', mockExpenses, 5000, 'ETB');
    expect(q4.answer).toContain('Yes, you can comfortably afford this');

    // 5. Savings
    const q5 = MelaFinanceIntelligence.answerQuestion('How much can I save monthly?', mockExpenses, 5000, 'ETB');
    expect(q5.answer).toContain('Savings Rate');
  });

  it('supports multi-currency formatting for ETB, USD, EUR, GBP, AED', () => {
    expect(formatCurrency(1500, 'ETB')).toContain('Br');
    expect(formatCurrency(1500, 'USD')).toContain('$');
    expect(formatCurrency(1500, 'EUR')).toContain('€');
    expect(formatCurrency(1500, 'GBP')).toContain('£');
    expect(formatCurrency(1500, 'AED')).toContain('AED');
  });
});

