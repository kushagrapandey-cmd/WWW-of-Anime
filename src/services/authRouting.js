export function getReturnPath(from) {
  const path = typeof from === 'string' ? from : from ? `${from.pathname ?? ''}${from.search ?? ''}${from.hash ?? ''}` : '/profile';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || /^\/(login|signup)([/?#]|$)/.test(path)) return '/profile';
  return path;
}
