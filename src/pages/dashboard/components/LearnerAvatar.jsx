import React from 'react';

// Local vector presets: no uploads, remote images, or personal image storage.
export const AVATARS = [
  ['avatar_01', '#eed7c5', '#342d45', '#6660c9', 'short'],
  ['avatar_02', '#a96945', '#252637', '#5279b8', 'curls'],
  ['avatar_03', '#e2ad87', '#403329', '#7362b3', 'long'],
  ['avatar_04', '#704934', '#27263a', '#557e8d', 'short'],
  ['avatar_05', '#f1c5a5', '#946643', '#6d74bb', 'curls'],
  ['avatar_06', '#c78d68', '#343147', '#5e729b', 'hijab'],
  ['avatar_07', '#8d5a3e', '#232938', '#7971b7', 'long'],
  ['avatar_08', '#f0d2ba', '#b48b57', '#537a99', 'short'],
  ['avatar_09', '#d3a480', '#4d414b', '#736ca8', 'hijab'],
  ['avatar_10', '#b87c55', '#292d37', '#607fb3', 'curls']
];

export default function LearnerAvatar({ id, size = 64 }) {
  const [, skin, hair, shirt, style] = AVATARS.find(avatar => avatar[0] === id) || AVATARS[0];
  return <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Selected learner avatar" style={{ flexShrink: 0, borderRadius: '50%' }}>
    <rect width="80" height="80" rx="40" fill="#ecebfa" />
    {(style === 'long' || style === 'hijab') && <path d="M17 61V32C17 5 63 5 63 32V61Z" fill={style === 'hijab' ? shirt : hair} />}
    <path d="M8 80V70Q10 54 40 54Q70 54 72 70V80" fill={shirt} />
    <path d="M32 48H48V60Q40 68 32 60Z" fill={skin} />
    <ellipse cx="40" cy="35" rx="18" ry="22" fill={skin} />
    {style === 'short' && <path d="M21 34V25Q21 9 41 10Q61 11 59 33L52 22Q39 29 26 22Z" fill={hair} />}
    {style === 'long' && <path d="M21 39Q16 9 41 10Q64 10 59 39L51 24L42 19Q31 31 21 39" fill={hair} />}
    {style === 'curls' && <g fill={hair}>{[23, 31, 40, 49, 57].map((x, i) => <circle key={x} cx={x} cy={i === 0 || i === 4 ? 24 : 16} r="9" />)}</g>}
    {style === 'hijab' && <path d="M18 51V28Q18 7 40 8Q62 7 62 28V55L51 60L55 31Q42 23 39 18Q32 30 24 32L29 60Z" fill={shirt} />}
    <g fill="#303044"><circle cx="33" cy="37" r="1.7" /><circle cx="47" cy="37" r="1.7" /></g>
    <path d="M35 47Q40 51 45 47" fill="none" stroke="#815849" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}
