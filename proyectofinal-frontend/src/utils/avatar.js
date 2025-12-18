export function makeFotoUrl(path) {
  if (!path) return null;
  const trimmed = String(path).trim();
  try {
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) return trimmed;
    if (lower.startsWith('//')) return `https:${trimmed}`;
  } catch {
    return null;
  }
  return `http://localhost:5000${trimmed}`;
}

export function makeFotoUrlWithProxy(path) {
  if (!path) return null;
  const trimmed = String(path).trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('googleusercontent.com') || lower.includes('lh3.googleusercontent.com')) {
    return `/api/auth/proxy_image?url=${encodeURIComponent(trimmed)}`;
  }
  return makeFotoUrl(trimmed);
}
