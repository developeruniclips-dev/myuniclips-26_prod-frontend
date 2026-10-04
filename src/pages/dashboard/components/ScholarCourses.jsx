import { formatMoney } from '../../../utils/paymentStatus.mjs';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, ArrowUpRight } from 'lucide-react';

export function courseStatus(course, videos) {
  if (!Number(course.approved)) return 'Application pending';
  if (!videos.length) return 'Ready to Upload';
  if (videos.every(v => Number(v.approved) === 1)) return 'Published';
  return videos.some(v => Number(v.approved) === 1) ? 'Published · More in review' : 'Pending Review';
}
export default function ScholarCourses({ courses, videos, limits, earnings, error, onRemove, removing }) {
  return <section className="scholar-section" aria-labelledby="scholar-courses-title">
    <div className="scholar-section-heading"><div><h2 id="scholar-courses-title">My UniClips Courses</h2><p>Create, prepare and share your next lesson.</p></div>
      <Link to="/create-course" className="btn btn-outline-primary"><Plus size={17} /> Teach a New Course</Link></div>
    {error ? <p role="alert">We couldn’t load your courses. Please refresh to try again.</p> : !courses.length ?
      <div className="scholar-empty"><BookOpen size={30} /><h3>Your teaching journey starts here</h3><p>Apply to teach a course from your approved programme.</p><Link className="btn btn-primary" to="/create-course">Teach a New Course</Link></div> :
      <div className="scholar-course-grid">{courses.map(course => {
        const lessons = videos?.filter(v => Number(v.subject_id) === Number(course.subject_id));
        const sales = earnings?.salesByCourse?.find(c => Number(c.id) === Number(course.subject_id));
        return <article className="scholar-course-card" key={course.subject_id}>
          <div className="scholar-course-symbol"><BookOpen size={23} /><span>{lessons ? courseStatus(course, lessons) : 'Content unavailable'}</span></div>
          <h3>{course.subject_name}</h3><p className="scholar-course-programme">{course.degree}</p>
          <div className="scholar-course-details"><span>{lessons ? `${lessons.length}${limits ? `/${limits.maxVideos}` : ''} videos uploaded` : 'Unable to load videos'}</span>
            <span>{sales ? `${sales.salesCount} sales` : `${course.sales_count ?? '—'} sales`}</span>
            {sales?.scholarEarnings != null && <span>€{sales.scholarEarnings} earned</span>}</div>
          {limits && lessons && <progress max={limits.maxVideos} value={lessons.length} aria-label="Video slots used" />}
          {Number(course.approved) === 1 ? <Link className="btn btn-primary" to={`/manage-course/${course.subject_id}`}>Manage Course <ArrowUpRight size={16} /></Link> : <p className="mb-0 small">Your application is awaiting admin approval.</p>}
          {course.id && lessons?.length === 0 && Number(course.sales_count) === 0 && <button className="btn btn-sm btn-link text-secondary align-self-start px-0" disabled={removing} onClick={() => onRemove(course)}>Remove empty application</button>}
        </article>;
      })}</div>}
  </section>;
}
