import {classificationFields, matchesCourseSearch} from './courseClassification.mjs';
export function publishedCourses(videos) {
  const groups = new Map();
  for (const video of videos.filter(v => Number(v.approved) === 1)) {
    const key = `${video.subject_id}-${video.scholar_user_id}`;
    if (!groups.has(key)) groups.set(key, {id:key, subjectId:video.subject_id, subjectName:video.subject_name,
      degreeProgramme:video.degree_programme, ...classificationFields(video), universityId:video.university_id,
      scholarId:video.scholar_user_id, scholarName:`${video.scholar_fname} ${video.scholar_lname}`,
      scholarInitials:`${video.scholar_fname?.[0] || ''}${video.scholar_lname?.[0] || ''}`,
      university:video.university_label || video.scholar_university || 'University not specified', videos:[]});
    groups.get(key).videos.push(video);
  }
  return [...groups.values()].map(course => {
    course.videos.sort((a,b) => Number(a.sequence_index)-Number(b.sequence_index));
    const first = course.videos[0], id = first.video_url?.match(/vimeo\.com\/(\d+)/)?.[1];
    return {...course, totalVideos:course.videos.length, firstVideoFree:Number(first.is_free)===1,
      thumbnailUrl:id ? `https://vumbnail.com/${id}.jpg` : '/course-fallback.svg'};
  });
}
export function filterPublishedCourses(courses, {search='',university='',programme='',general=false}) {
  return courses.filter(c => (!university || String(c.universityId)===String(university))
    && (!programme || (c.applicable_programmes || [c.degreeProgramme]).includes(programme))
    && (!general || c.is_general_university_course) && matchesCourseSearch(c,search));
}
