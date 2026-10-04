import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ShoppingBag, TrendingUp, Wallet, Plus } from 'lucide-react';
import { useAuth } from '../../../context/temp';
import LearnerAvatar from './LearnerAvatar';
import ScholarCourses from './ScholarCourses';
import ScholarEarnings, { money } from './ScholarEarnings';
import useCourseLimits from './useCourseLimits';
import teacherIllustration from '../../../assets/teacher.png';

export default function ScholarTabs() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [actionError, setActionError] = useState('');
  const limits = useCourseLimits();
  const tab = params.get('tab') === 'earnings' ? 'earnings' : 'courses';
  async function removeCourse(course) {
    if (!window.confirm(`Remove the empty application for "${course.subject_name}"?`)) return;
    setRemoving(true); setActionError('');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/scholar-subjects/my/${course.id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setData(previous => ({ ...previous, courses: { subjects: previous.courses.subjects.filter(item => item.id !== course.id) } }));
    } catch (error) { setActionError(error.response?.data?.message || 'Unable to remove this application'); }
    finally { setRemoving(false); }
  }
  useEffect(() => {
    let active = true;
    setData({}); setLoading(true);
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    async function load() {
      const profileResults = await Promise.allSettled([
        axios.get(`${api}/users/profile`, config), axios.get(`${api}/scholar-profile/status`, config)
      ]);
      if (!active) return;
      const profile = profileResults[0].status === 'fulfilled' ? profileResults[0].value.data : null;
      const scholar = profileResults[1].status === 'fulfilled' ? profileResults[1].value.data : null;
      setData({ profile, scholar });
      if (scholar?.approved) {
        const names = ['courses', 'videos', 'earnings', 'stripe'];
        const paths = ['/scholar-subjects/status', '/videos/scholar/my-videos', '/stripe-connect/earnings', '/stripe-connect/account-status'];
        const results = await Promise.allSettled(paths.map(path => axios.get(`${api}${path}`, config)));
        if (!active) return;
        const next = { profile, scholar };
        results.forEach((result, index) => { next[names[index]] = result.status === 'fulfilled' ? result.value.data : null; });
        setData(next);
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [user.id, user.token]);
  if (loading) return <div className="scholar-shell"><p role="status">Loading your teaching workspace...</p></div>;
  const approved = Boolean(data.scholar?.approved);
  const profile = data.scholar?.profile;
  const courses = data.courses?.subjects;
  const videos = data.videos?.videos;
  const summary = data.earnings?.summary;
  const stats = [
    [BookOpen, 'Total Courses', courses?.length ?? '\u2014'],
    [ShoppingBag, 'Total Sales', summary?.totalSales ?? '\u2014'],
    [TrendingUp, "This Month's Sales", summary?.monthlySales ?? '\u2014'],
    [Wallet, 'Total Earnings', money(summary?.scholarEarnings)]
  ];
  return <main className="scholar-shell">
    <div className="scholar-topline"><span>MY UNICLIPS / SCHOLAR WORLD</span><Link to="/dashboard">Learner Dashboard &rarr;</Link></div>
    <section className="scholar-hero">
      <div><div className="scholar-identity"><LearnerAvatar id={data.profile?.avatar_id} size={64} /><div><h1>Welcome back, Scholar {data.profile?.fname || user.fname || ''} &#128075;</h1><p>Share what you know. Help students succeed.</p></div></div>
        <div className="scholar-academic"><span>{[data.profile?.fname, data.profile?.lname].filter(Boolean).join(' ')}</span><span>{profile?.university}</span><span>{profile?.degree}</span><span>{profile?.country_name}</span></div>
        {approved && <Link to="/create-course" className="btn btn-primary"><Plus size={18} /> Teach a New Course</Link>}
      </div><img className="scholar-hero-illustration" src={teacherIllustration} alt="" />
    </section>
    {!data.scholar ? <div className="scholar-section" role="alert">We could not confirm your Scholar status. Refresh to try again.</div> : !approved ? <div className="scholar-section"><h2>Your Scholar application</h2><p>{profile ? 'Your application is awaiting admin approval. Your teaching workspace will become available once approved.' : 'Complete your Scholar application to start teaching.'}</p>{!profile && <Link to="/become-scholar" className="btn btn-primary">Scholar application</Link>}</div> : <>
      <div className="scholar-metrics">{stats.map(([Icon, label, value]) => <div className="scholar-metric" key={label}><Icon size={21} /><span>{label}</span><strong>{value}</strong></div>)}</div>
      {params.get('stripe') && <p className="scholar-note">Stripe setup returned to UniClips. Your current connection status is shown in Earnings & Payouts.</p>}
      <nav className="scholar-tabs" aria-label="Scholar workspace"><Link to="/support">Support</Link><button className={tab === 'courses' ? 'active' : ''} onClick={() => setParams({})}>My Courses</button><button className={tab === 'earnings' ? 'active' : ''} onClick={() => setParams({ tab: 'earnings' })}>Earnings & Payouts</button>{tab === 'earnings' && <Link to="/scholar-dashboard">&larr; Scholar Dashboard</Link>}</nav>
      {actionError && <p role="alert" className="alert alert-danger">{actionError}</p>}
      {tab === 'courses' ? <ScholarCourses courses={courses || []} videos={videos} earnings={data.earnings} limits={limits} error={!courses} onRemove={removeCourse} removing={removing} /> : <ScholarEarnings data={data.earnings} stripe={data.stripe} token={user.token} countryCode={profile?.country_code} hasVideos={videos ? videos.length > 0 : null} />}
    </>}
  </main>;
}
