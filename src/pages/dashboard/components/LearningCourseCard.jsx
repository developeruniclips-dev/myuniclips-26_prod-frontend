import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { learningHref } from '../learnerData.mjs';
import { courseCategoryLabel } from '../../../utils/courseClassification.mjs';

export default function LearningCourseCard({ course, saved, onSave, saving, featured = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const vimeoId = course.videos?.[0]?.video_url?.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  const image = vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : null;
  const progress = course.progress;
  const action = !course.purchased ? 'View Course' : !course.active ? 'View Access' : progress?.completed ? 'Review Course' : progress?.started ? 'Continue Learning' : 'Start Learning';
  return <article className={`learning-course${featured ? ' learning-course-featured' : ''}`}>
    <div className="learning-course-image">
      {image && !imageFailed ? <img src={image} alt="" loading="lazy" onError={() => setImageFailed(true)} /> : <div className="learning-course-art" aria-hidden="true"><i className="bi bi-collection-play" /></div>}
      {course.purchased && <span className="learning-course-tag">{!course.active ? 'Access expired' : progress?.completed ? 'Completed' : 'Purchased'}</span>}
    </div>
    <div className="learning-course-body">
      {course.programme && <p className="learning-course-programme">{courseCategoryLabel(course, course.programme)}</p>}
      <h3><Link to={learningHref(course)}>{course.title}</Link></h3>
      {course.university && <p className="learning-course-meta">{course.university}</p>}
      {course.scholar && <p className="learning-course-meta"><i className="bi bi-person" aria-hidden="true" /> {course.scholar}</p>}
      {course.totalVideos > 0 && <p className="learning-course-meta"><i className="bi bi-play-circle" aria-hidden="true" /> {course.totalVideos} {course.purchased && !course.bundle ? 'purchased lessons' : 'videos'}</p>}
      {course.purchased && progress && <div className="learning-progress">
        <div><span>{progress.started ? `${progress.watched} of ${progress.total} lessons completed` : 'Not started yet'}</span><strong>{progress.percent}%</strong></div>
        <div className="learning-progress-track" role="progressbar" aria-label={`${course.title} completed lessons`} aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percent}%` }} /></div>
      </div>}
      {course.purchased && !progress && <p className="learning-course-meta">Progress unavailable</p>}
      {featured && progress?.lastLesson && <p className="learning-last-lesson">Last lesson: {progress.lastLesson.title}</p>}
      <div className="learning-course-actions">
        <Link className="btn btn-primary" to={learningHref(course)}>{action}<i className="bi bi-arrow-right ms-2" aria-hidden="true" /></Link>
        {onSave && course.subjectId && course.scholarId && <button className="btn btn-outline-primary" type="button" onClick={() => onSave(course)} disabled={saving} aria-label={`${saved ? 'Remove' : 'Save'} ${course.title}${saved ? ' from saved courses' : ''}`} aria-pressed={!!saved} title={saved ? 'Remove from saved courses' : 'Save course'}><i className={`bi bi-bookmark${saved ? '-fill' : ''}`} aria-hidden="true" /></button>}
      </div>
    </div>
  </article>;
}
