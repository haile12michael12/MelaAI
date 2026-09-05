export function searchFullText<T>(items: T[], query: string, keys: (keyof T)[]): T[] {
  const q = query.toLowerCase();
  return items.filter(item =>
    keys.some(key => String(item[key]).toLowerCase().includes(q))
  );
}
