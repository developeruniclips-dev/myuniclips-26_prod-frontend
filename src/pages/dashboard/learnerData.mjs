import { classificationFields, matchesProgramme } from '../../utils/courseClassification.mjs';

export const courseKey = (subjectId, scholarId) => `${subjectId}-${scholarId}`;
const dateValue = (value) => Date.parse(value) || 0;

export function buildCatalog(videos) {
  const courses = new Map();
  videos.filter(video => Number(video.approved) === 1).forEach(video => {
    const key = courseKey(video.subject_id, video.scholar_user_id);
    if (!courses.has(key)) courses.set(key, {
      key, subjectId: video.subject_id, scholarId: video.scholar_user_id,
      title: video.subject_name, programme: video.degree_programme,
      ...classificationFields(video),
      universityId: video.university_id, university: video.scholar_university || video.university_label,
      scholar: [video.scholar_fname, video.scholar_lname].filter(Boolean).join(' '), videos: []
    });
    const course = courses.get(key);
    if (!course.videos.some(item => String(item.id) === String(video.id))) course.videos.push(video);
  });
  return [...courses.values()].map(course => {
    course.videos.sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index));
    // There is no course publication timestamp: use first approved lesson's creation date.
    const dates = course.videos.map(v => dateValue(v.created_at)).filter(Boolean);
    return { ...course, createdAt: dates.length ? Math.min(...dates) : 0, totalVideos: course.videos.length };
  }).sort((a, b) => b.createdAt - a.createdAt || a.key.localeCompare(b.key));
}

export function withProgress(course, progress) {
  if (progress === null || !course.videos?.length) return { ...course, progress: null };
  const ids = new Set(course.videos.map(video => String(video.id)));
  const records = progress.filter(record => ids.has(String(record.video_id)));
  const watched = new Set(records.filter(record => Number(record.watched) === 1).map(record => String(record.video_id))).size;
  const started = records.filter(record => Number(record.watched) === 1 || Number(record.progress_seconds) > 0);
  const lastLesson = [...started].sort((a, b) => dateValue(b.watched_at) - dateValue(a.watched_at))[0];
  return { ...course, progress: {
    watched, total: ids.size, percent: Math.round(watched / ids.size * 100),
    started: started.length > 0, completed: watched === ids.size,
    lastLesson, lastActivity: dateValue(lastLesson?.watched_at)
  } };
}

export function buildPurchased(catalog, bundles, legacy, progress, now = Date.now()) {
  const courses = new Map();
  bundles.forEach(purchase => {
    const key = courseKey(purchase.subject_id, purchase.scholar_id);
    const active = Number(purchase.is_access_active ?? 1) === 1 &&
      (!purchase.access_expires_at || dateValue(purchase.access_expires_at) > now);
    if (courses.get(key)?.active) return;
    const course = catalog.find(item => item.key === key) || {
      key, subjectId: purchase.subject_id, scholarId: purchase.scholar_id,
      title: purchase.subject_name, programme: purchase.degree_programme,
      universityId: purchase.university_id, university: purchase.university_label,
      ...classificationFields(purchase),
      scholar: [purchase.scholar_fname, purchase.scholar_lname].filter(Boolean).join(' '), videos: []
    };
    courses.set(key, { ...course, purchased: true, active, bundle: true });
  });
  legacy.forEach(purchase => {
    const catalogCourse = catalog.find(course => course.videos.some(v => String(v.id) === String(purchase.video_id)));
    const key = catalogCourse?.key || (purchase.subject_id && purchase.scholar_id
      ? courseKey(purchase.subject_id, purchase.scholar_id) : `video-${purchase.video_id}`);
    if (courses.get(key)?.bundle && courses.get(key).active) return;
    const video = catalogCourse?.videos.find(v => String(v.id) === String(purchase.video_id)) || {
      id: purchase.video_id, title: purchase.title, video_url: purchase.video_url
    };
    if (!courses.has(key) || courses.get(key).bundle) courses.set(key, {
      ...catalogCourse, key, title: catalogCourse?.title || purchase.title,
      subjectId: catalogCourse?.subjectId || purchase.subject_id,
      scholarId: catalogCourse?.scholarId || purchase.scholar_id,
      videos: [], purchased: true, active: true, bundle: false
    });
    const course = courses.get(key);
    if (!course.videos.some(v => String(v.id) === String(video.id))) course.videos.push(video);
  });
  return [...courses.values()].map(course => withProgress({ ...course, totalVideos: course.videos.length }, progress));
}

export function learningHref(course) {
  if (course.purchased && !course.bundle) return `/watch/${course.progress?.lastLesson?.video_id || course.videos[0]?.id}`;
  return `/course/${course.subjectId}/${course.scholarId}`;
}

export function recommendCourses(catalog, purchased, profile) {
  const owned = new Set(purchased.filter(course => course.active).map(course => course.key));
  const score = course => {
    const university = profile?.university_id && String(course.universityId) === String(profile.university_id);
    const programme = matchesProgramme(course, profile?.degree_programme, profile?.university_id);
    return university && programme ? 3 : university ? 2 : programme ? 1 : 0;
  };
  return catalog.filter(course => !owned.has(course.key)).sort((a, b) => score(b) - score(a) || b.createdAt - a.createdAt).slice(0, 4);
}

export function selectNewCourses(catalog, recommended) {
  const recommendedKeys = new Set(recommended.map(course => course.key));
  const dated = catalog.filter(course => course.createdAt).sort((a, b) => b.createdAt - a.createdAt);
  const different = dated.filter(course => !recommendedKeys.has(course.key));
  // Prefer four different courses; allow at most one shared course. If the
  // catalogue is small, show fewer cards instead of repeating the same row.
  const shared = dated.filter(course => recommendedKeys.has(course.key)).slice(0, 1);
  return [...different.slice(0, 4), ...shared].slice(0, 4).sort((a, b) => b.createdAt - a.createdAt);
}
