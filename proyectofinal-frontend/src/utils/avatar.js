import api from '../config/api';

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
  return `${api.baseURL}${trimmed}`;
}

export function makeFotoUrlWithProxy(path) {
  if (!path) return null;
  const trimmed = String(path).trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('googleusercontent.com') || lower.includes('lh3.googleusercontent.com')) {
    return `${api.baseURL}${api.endpoints.auth.proxyImage}?url=${encodeURIComponent(trimmed)}`;
  }
  return makeFotoUrl(trimmed);
}
