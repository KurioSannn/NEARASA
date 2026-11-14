type SearchIntent = { q: string; maxPrice: number | null; chooseBudget: boolean };

export function parseSearchIntent(value: string): SearchIntent {
  const amount = '(\\d{1,3}(?:[.]\\d{3})+|\\d+(?:[,.]\\d+)?)';
  const unit = '\\s*(ribu|rb|k)?';
  const patterns = [
    new RegExp(`(?:\\b(?:maksimal|maksimum|max|di bawah|dibawah|kurang dari|sampai(?: dengan)?|hingga)\\s*|(?:≤|<=)\\s*)(?:rp\\.?\\s*)?${amount}${unit}\\b`, 'i'),
    new RegExp(`\\brp\\.?\\s*${amount}${unit}\\b`, 'i'),
    new RegExp(`\\b${amount}\\s*(ribu|rb|k)\\b`, 'i'),
  ];
  const match = patterns.map(pattern => value.match(pattern)).find(Boolean);
  let maxPrice: number | null = null;
  if (match) {
    const raw = match[1];
    const numeric = /^\d{1,3}(?:[.]\d{3})+$/.test(raw) ? Number(raw.replaceAll('.', '')) : Number(raw.replace(',', '.'));
    const price = Math.round(numeric * (match[2] ? 1000 : 1));
    if (Number.isFinite(price) && price > 0 && price <= 10000000) maxPrice = price;
  }
  const cheap = /\bmurah\b/i.test(value);
  let q = maxPrice !== null && match ? value.replace(match[0], ' ') : value;
  if (cheap) q = q.replace(/\bmurah\b|\bdekat sini\b|^\s*(?:makan|makanan)\b/gi, ' ');
  q = q.replace(/\s+/g, ' ').trim();
  return { q, maxPrice, chooseBudget: cheap && maxPrice === null };
}
