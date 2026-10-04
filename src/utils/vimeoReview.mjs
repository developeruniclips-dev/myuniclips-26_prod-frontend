// Only existing Vimeo watch/player URLs are accepted. No provider credentials are used.
export function vimeoReviewEmbed(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const match = url.hostname === 'player.vimeo.com'
      ? url.pathname.match(/^\/video\/(\d+)\/?$/)
      : ['vimeo.com', 'www.vimeo.com'].includes(url.hostname) && url.pathname.match(/^\/(\d+)(?:\/([a-zA-Z0-9]{6,64}))?\/?$/);
    if (!match) return null;
    const hash = url.searchParams.get('h') || match[2];
    if (hash && !/^[a-zA-Z0-9]{6,64}$/.test(hash)) return null;
    return `https://player.vimeo.com/video/${match[1]}${hash ? `?h=${hash}` : ''}`;
  } catch { return null; }
}
