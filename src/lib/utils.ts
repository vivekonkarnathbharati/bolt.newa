export function timeAgo(iso: string): string {
  const d = +new Date(iso);
  const diff = Date.now() - d;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w`;
  const mo = Math.floor(day / 30);
  return `${mo}mo`;
}

export function formatCount(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
