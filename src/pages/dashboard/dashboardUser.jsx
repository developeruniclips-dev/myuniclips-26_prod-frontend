import React, { useEffect, useState } from 'react';
import { Container, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/temp';
import LearnerAvatar from './components/LearnerAvatar';
import LearningCourseCard from './components/LearningCourseCard';
import { buildCatalog, buildPurchased, courseKey, recommendCourses, selectNewCourses, withProgress } from './learnerData.mjs';
import './learnerDashboard.css';
import { classificationFields, matchesProgramme, matchesCourseSearch } from '../../utils/courseClassification.mjs';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const requests = {
  profile: '/users/profile', catalog: '/videos/all-videos',
  bundles: '/purchases/subject/my-purchases', legacy: '/purchases/my-purchases',
  saved: '/library/my-library', progress: '/library/learning-progress',
  universities: '/locations/universities', scholar: '/scholar-profile/status'
};

function EmptyLearning({ title, children }) {
  return <div className="learning-empty"><i className="bi bi-journal-bookmark" aria-hidden="true" /><div><h3>{title}</h3><p>{children}</p></div><Link className="btn btn-outline-primary" to="/all-videos">Explore Courses</Link></div>;
}

function CourseSection({ id, title, description, action, loading, available, courses, renderCard, featured, children }) {
  return <section className="learning-section" aria-labelledby={id}>
    <div className="learning-section-heading"><div><h2 id={id}>{title}</h2><p>{description}</p></div>{action}</div>
    {loading ? <p className="learning-loading" role="status">Loading your learning space…</p>
      : !available ? <p className="learning-unavailable">This information is temporarily unavailable.</p>
      : courses.length ? <div className={featured ? 'learning-continue-grid' : 'learning-course-grid'}>{courses.map(course => renderCard(course, featured))}</div> : children}
  </section>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [learningSearch, setLearningSearch] = useState('');
  const [activeTab, setActiveTab] = useState('purchased');
  const [saving, setSaving] = useState(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    setLoading(true);
    const entries = Object.entries(requests);
    Promise.allSettled(entries.map(([, path]) => axios.get(`${API}${path}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }))).then(results => {
      if (cancelled) return;
      const next = {};
      const failed = [];
      results.forEach((result, index) => {
        const key = entries[index][0];
        if (result.status === 'fulfilled') next[key] = result.value.data;
        else failed.push(key);
      });
      setData(next);
      setErrors(failed);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.token, reload]);

  const catalog = buildCatalog(data.catalog?.videos || []).map(course => ({
    ...course,
    university: course.university || data.universities?.find(item => String(item.id) === String(course.universityId))?.name
  }));
  const progress = data.progress?.progress ?? null;
  const purchasesReady = !!data.bundles && !!data.legacy;
  const purchased = buildPurchased(catalog, data.bundles?.purchases || [], data.legacy?.purchases || [], progress);
  const savedRows = data.saved?.library || [];
  const savedKeys = new Set(savedRows.map(course => courseKey(course.subject_id, course.scholar_id)));
  const saved = savedRows.map(row => {
    const key = courseKey(row.subject_id, row.scholar_id);
    return purchased.find(course => course.key === key) || withProgress(catalog.find(course => course.key === key) || {
      key, subjectId: row.subject_id, scholarId: row.scholar_id, title: row.subject_name,
      programme: row.degree_programmes, university: row.scholar_university || row.university_label,
      universityId: row.university_id, ...classificationFields(row),
      scholar: [row.scholar_fname, row.scholar_lname].filter(Boolean).join(' '),
      videos: row.videos || [], totalVideos: row.totalVideos
    }, progress);
  });
  const inProgress = purchased.filter(course => course.progress?.started && !course.progress.completed);
  const completed = purchased.filter(course => course.progress?.completed);
  const continuing = inProgress.filter(course => course.active).sort((a, b) => b.progress.lastActivity - a.progress.lastActivity).slice(0, 2);
  const recommended = recommendCourses(catalog, purchased, data.profile);
  const university = data.universities?.find(item => String(item.id) === String(data.profile?.university_id));
  const hasMatchingProgramme = recommended.some(course => matchesProgramme(course, data.profile?.degree_programme, data.profile?.university_id));
  const scholarAccess = user?.roles?.includes('Scholar');
  const isApplicant = data.scholar?.isScholar && !data.scholar?.approved;
  const progressReady = purchasesReady && !!data.catalog && !!data.progress;
  const stats = [
    ['Courses Purchased', purchasesReady ? purchased.length : null, 'bag-check'],
    ['Saved Courses', data.saved ? savedKeys.size : null, 'bookmark'],
    ['Completed', progressReady ? completed.length : null, 'check2-circle'],
    ['In Progress', progressReady ? inProgress.length : null, 'play-circle']
  ];

  const toggleSaved = async course => {
    if (saving) return;
    const removing = savedKeys.has(course.key);
    setSaving(course.key);
    setSaveError('');
    try {
      await axios.post(`${API}/library/${removing ? 'remove' : 'add'}`, {
        subjectId: course.subjectId, scholarId: course.scholarId
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setData(previous => ({ ...previous, saved: { library: removing
        ? previous.saved.library.filter(row => courseKey(row.subject_id, row.scholar_id) !== course.key)
        : [...previous.saved.library, { subject_id: course.subjectId, scholar_id: course.scholarId, subject_name: course.title,
          degree_programmes: course.programme, scholar_university: course.university, university_id: course.universityId,
          ...classificationFields(course), videos: course.videos, totalVideos: course.totalVideos }] } }));
    } catch {
      setSaveError('Your saved courses could not be updated. Please try again.');
    } finally { setSaving(null); }
  };
  const renderCard = (course, featured = false) => <LearningCourseCard key={course.key} course={course} featured={featured} saved={savedKeys.has(course.key)} onSave={data.saved ? toggleSaved : null} saving={!!saving} />;

  return <main className="learner-dashboard">
    <Container className="learning-container">
      <header className="learning-hero">
        <div className="learning-identity"><LearnerAvatar id={data.profile?.avatar_id} size={68} /><div><span className="learning-eyebrow">MY UNICLIPS</span><h1>Welcome back, {data.profile?.fname || user?.fname || user?.firstname || 'learner'} <span aria-hidden="true">👋</span></h1><p>What do you want to learn today?</p></div></div>
        <div className="learning-account-actions"><Link to="/support" className="btn btn-outline-primary">Support</Link><Link to="/edit-profile" className="btn btn-outline-primary"><i className="bi bi-person-gear me-2" aria-hidden="true" />Edit Profile</Link>{scholarAccess && <Link to="/scholar-dashboard" className="btn btn-primary">Scholar Dashboard</Link>}<button type="button" className="btn btn-link" onClick={() => { logout(); navigate('/'); }}>Logout</button></div>
        <form className="learning-search" role="search" onSubmit={event => { event.preventDefault(); navigate(`/all-videos${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`); }}><i className="bi bi-search" aria-hidden="true" /><label className="visually-hidden" htmlFor="learner-course-search">Search courses, subjects or topics</label><input id="learner-course-search" type="search" placeholder="Search courses, subjects or topics..." value={search} onChange={event => setSearch(event.target.value)} /><button type="submit" className="btn btn-primary">Search</button></form>
      </header>
      {errors.length > 0 && <Alert variant="warning">Some learning information could not be loaded. Unavailable counts are shown as —. <button className="btn btn-link p-0" onClick={() => setReload(value => value + 1)}>Try again</button></Alert>}
      {saveError && <Alert variant="danger" onClose={() => setSaveError('')} dismissible>{saveError}</Alert>}
      <section className="learning-stats" aria-label="Your learning statistics">{stats.map(([label, value, icon]) => <div className="learning-stat" key={label}><span className="learning-stat-icon"><i className={`bi bi-${icon}`} aria-hidden="true" /></span><div><strong>{loading || value === null ? '—' : value}</strong><span>{label}</span></div></div>)}</section>

      <CourseSection id="continue-heading" title="Continue Learning" description="A little progress, one lesson at a time." loading={loading} available={progressReady} courses={continuing} renderCard={renderCard} featured>
        <EmptyLearning title="Your next lesson is waiting">{purchased.length ? 'Start a course from My Learning, or explore something new.' : 'Find a course for your studies and make your first step.'}</EmptyLearning>
      </CourseSection>
      <section className="learning-section learning-my-courses" aria-labelledby="my-learning-heading">
        <div className="learning-section-heading"><div><h2 id="my-learning-heading">My Learning</h2><p>Your courses, all in one place.</p></div><Link to="/all-videos">Explore Courses →</Link></div>
        <label className="visually-hidden" htmlFor="my-learning-search">Filter My Learning</label><input id="my-learning-search" className="form-control learning-filter" type="search" placeholder="Find a course in My Learning" value={learningSearch} onChange={event => setLearningSearch(event.target.value)} />
        <Tabs id="my-learning-tabs" activeKey={activeTab} onSelect={setActiveTab} className="learning-tabs">
          {[['purchased', 'Purchased', purchased], ['progress', 'In Progress', inProgress], ['completed', 'Completed', completed], ['saved', 'Saved', saved]].map(([key, label, courses]) => {
            const filtered = courses.filter(course => matchesCourseSearch(course, learningSearch));
            const unavailable = key === 'saved' ? !data.saved : key === 'purchased' ? !purchasesReady : !progressReady;
            return <Tab key={key} eventKey={key} title={label}>{loading ? <p role="status" className="learning-loading">Loading your courses…</p> : unavailable ? <p className="learning-unavailable">These courses could not be loaded. Please try again.</p> : filtered.length ? <div className="learning-course-grid">{filtered.map(course => renderCard(course))}</div> : <EmptyLearning title={learningSearch ? 'No matching courses' : { purchased: 'Make room for your next discovery', progress: 'Ready when you are', completed: 'Every lesson brings you closer', saved: 'Keep your next course close' }[key]}>{learningSearch ? 'Try a different course or programme name.' : { purchased: 'Your purchased courses will appear here.', progress: 'Courses you start will appear here so you can pick up where you left off.', completed: 'Finish the lessons in a course to see it here.', saved: 'Use the bookmark on a course to save it for later.' }[key]}</EmptyLearning>}</Tab>;
          })}
        </Tabs>
      </section>

      <CourseSection id="recommended-heading" title="Recommended for You" description={hasMatchingProgramme && university ? `Based on your programme at ${university.short_name || university.name}` : 'Explore courses for your next learning goal.'} action={<Link to="/edit-profile">{university ? 'Update interests' : 'Personalize your learning'} →</Link>} loading={loading} available={!!data.catalog} courses={recommended} renderCard={renderCard}>
        <EmptyLearning title="You’re all caught up">Browse the catalogue or revisit a course in My Learning.</EmptyLearning>
      </CourseSection>

      <CourseSection id="new-heading" title="New on UniClips" description="Explore the latest courses in the catalogue." action={<Link to="/all-videos">See all →</Link>} loading={loading} available={!!data.catalog} courses={selectNewCourses(catalog, recommended).map(course => purchased.find(item => item.key === course.key) || course)} renderCard={renderCard}>
        <EmptyLearning title="More learning is on the way">Check back for courses as scholars publish them.</EmptyLearning>
      </CourseSection>
      {scholarAccess ? <aside className="learning-scholar"><div><h2>Keep sharing what you know</h2><p>Your teaching tools are one click away.</p></div><Link className="btn btn-primary" to="/scholar-dashboard">Scholar Dashboard →</Link></aside> : data.scholar && !data.scholar.approved && <aside className="learning-scholar"><div><h2>{isApplicant ? 'Your Scholar journey has started' : 'Know a course really well? 🎓'}</h2><p>{isApplicant ? 'Your application is awaiting approval. Keep learning while the team reviews it.' : 'Help other students understand it and earn from your knowledge.'}</p></div>{!isApplicant && <Link className="btn btn-primary" to="/become-scholar">Become a Scholar →</Link>}</aside>}
    </Container>
  </main>;
}
