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

export function courseCover(subjectId, scholarId, firstLessonId) {
  if (![subjectId, scholarId].every(id => /^(?:[1-9][0-9]*)$/.test(String(id)))) return '/course-fallback.svg';
  const cover = covers[String(subjectId) + '-' + String(scholarId)];
  if (!cover || (firstLessonId !== undefined && String(firstLessonId) !== String(cover.firstLessonId))) return '/course-fallback.svg';
  return cover.image;
}
