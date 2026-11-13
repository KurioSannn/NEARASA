export function jsonRequestHeaders(): Record<string, string> {
  const cookie = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='));
  const token = cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (token) headers[cookie ? 'X-XSRF-TOKEN' : 'X-CSRF-TOKEN'] = token;
  return headers;
}
