// Public cover images use only UniClips identifiers. No provider URLs or playback capabilities.
const covers = {
  "1478-18": {
    "firstLessonId": 23,
    "image": "/course-covers/lesson-23-ceffe7364258.jpg"
  },
  "1479-18": {
    "firstLessonId": 29,
    "image": "/course-covers/lesson-29-ceffe7364258.jpg"
  },
  "1435-23": {
    "firstLessonId": 35,
    "image": "/course-covers/lesson-35-ceffe7364258.jpg"
  },
  "1439-25": {
    "firstLessonId": 49,
    "image": "/course-covers/lesson-49-cefed7b22a3e.jpg"
  },
  "1374-31": {
    "firstLessonId": 53,
    "image": "/course-covers/lesson-53-e6961b0f09b6.jpg"
  },
  "2301-30": {
    "firstLessonId": 64,
    "image": "/course-covers/lesson-64-6f75c0c8cb3f.jpg"
  },
  "2308-30": {
    "firstLessonId": 74,
    "image": "/course-covers/lesson-74-f3bea410f1e7.jpg"
  }
};

export function courseCover(subjectId, scholarId, firstLessonId, api = import.meta.env ? import.meta.env.VITE_API_URL || 'http://localhost:3001/api' : undefined) {
  if (![subjectId, scholarId].every(id => /^(?:[1-9][0-9]{0,9})$/.test(String(id)) && Number(id) <= 2147483647)) return '/course-fallback.svg';
  const cover = covers[String(subjectId) + '-' + String(scholarId)];
  if (cover) return firstLessonId !== undefined && String(firstLessonId) !== String(cover.firstLessonId) ? '/course-fallback.svg' : cover.image;
  // The API authorizes the currently published first lesson on every image read.
  // Existing bundled covers retain their exact original paths and bytes.
  try {
    if (typeof api !== 'string') return '/course-fallback.svg';
    const url = new URL(api);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9/_-]*$/.test(url.pathname)) return '/course-fallback.svg';
    return url.href.replace(/\/$/, '') + '/videos/covers/' + subjectId + '/' + scholarId;
  } catch { return '/course-fallback.svg'; }
}
