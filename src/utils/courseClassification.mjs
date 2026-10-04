// Classification is supplied by the backend. Keep it separate from programme identity.
export function classificationFields(row) {
  return {
    is_general_university_course: row.is_general_university_course === true,
    course_category_label: row.course_category_label,
    programme_language: row.programme_language,
    applicable_programmes: row.applicable_programmes
  };
}

export function courseCategoryLabel(course, fallback = '') {
  if (!course.is_general_university_course) return fallback;
  return course.course_category_label || (course.programme_language === 'fi'
    ? 'Yleinen korkeakoulukurssi' : 'General University Course');
}

const normalize = value => String(value || '').trim().replace(/\s+/gu, ' ').toLowerCase();
export function matchesProgramme(course, programme, universityId) {
  if (!programme || !universityId || String(course.universityId) !== String(universityId)) return false;
  const programmes = course.applicable_programmes || [course.programme || course.degreeProgramme];
  return programmes.some(value => normalize(value) === normalize(programme));
}

export function matchesCourseSearch(course, search) {
  const query = normalize(search);
  if (!query) return true;
  return [course.subjectName, course.title, course.scholarName, course.scholar,
    course.degreeProgramme, course.programme, course.university, course.course_category_label,
    ...(course.applicable_programmes || [])].some(value => normalize(value).includes(query));
}
