import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/temp';
import './scholarDashboard.css';
import VideoMetadataFields, { metadataError } from './components/VideoMetadataFields';

export default function ManageCourse() {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  useEffect(() => {
    if (editing?.id) document.getElementById('lesson-title')?.focus();
  }, [editing?.id]);
  async function refresh() {
    const response = await axios.get(`${api}/videos/scholar/courses/${subjectId}`, config);
    setData(response.data);
  }
  useEffect(() => {
    let active = true;
    setData(null); setError(''); setEditing(null); setPreview(null);
    axios.get(`${api}/videos/scholar/courses/${subjectId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => { if (active) setData(res.data); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Unable to load this course'); });
    return () => { active = false; };
  }, [api, subjectId, user.token]);
  async function mutate(work, message) {
    setBusy(true); setError(''); setNotice('');
    try { await work(); await refresh(); setNotice(message); }
    catch (err) { setError(err.response?.data?.message || 'Unable to save. Refresh and try again.'); }
    finally { setBusy(false); }
  }
  function move(index, direction) {
    const ids = data.videos.map(v => v.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    mutate(() => axios.put(`${api}/videos/scholar/courses/${subjectId}/order`, { videoIds: ids }, config), 'Lesson order saved.');
  }
  function save(event) {
    event.preventDefault();
    const textError = metadataError(editing.title, editing.description, data.limits);
    if (textError) { setError(textError); return; }
    mutate(async () => {
      await axios.patch(`${api}/videos/my/${editing.id}`, { title: editing.title, description: editing.description }, config);
      setEditing(null);
    }, 'Lesson details saved for admin review.');
  }
  function remove(video) {
    if (!window.confirm(`Delete the unapproved lesson “${video.title}”? This cannot be undone.`)) return;
    mutate(() => axios.delete(`${api}/videos/my/${video.id}`, config), 'Unapproved lesson deleted.');
  }
  return <div className="scholar-workspace"><main className="scholar-shell">
    <Link className="btn btn-outline-primary mb-4" to="/scholar-dashboard">← Scholar Dashboard</Link>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {notice && <p role="status" className="alert alert-success">{notice}</p>}
    {!data ? !error && <p role="status">Loading course content…</p> : <>
      <header className="scholar-section scholar-section-heading"><div><span className="scholar-eyebrow">COURSE CONTENT</span><h1>{data.course.course_name}</h1><p>{data.videos.length} of {data.limits.maxVideos} videos uploaded</p><small>{data.course.degree}</small></div>
        {data.videos.length < data.limits.maxVideos && <Link className="btn btn-primary" to={`/upload-video?subject_id=${subjectId}`}><Plus size={18} /> Upload Video</Link>}</header>
      <section className="scholar-section"><h2>Your lessons</h2><p>{data.orderLocked ? 'Lesson order is locked because this course contains approved content. Unapproved lesson titles and descriptions can still be corrected.' : 'Use Move Up and Move Down to arrange your lessons before admin approval. Lesson 1 is the free preview.'}</p>
        {!data.videos.length ? <div className="scholar-empty"><h3>Ready for your first lesson</h3><p>Upload a video to start preparing this course for review.</p></div> : <ol className="scholar-lessons">{data.videos.map((video, index) => <li key={video.id}>
          <span className="scholar-sequence" aria-label={`Lesson ${video.sequence_index}`}>{video.sequence_index}</span>
          <div className="scholar-lesson-info"><h3>{video.title}</h3><span className="scholar-status">{Number(video.approved) === 1 ? 'Approved / Published' : 'Pending Review'}</span>{video.description && <p>{video.description}</p>}
            <button className="btn btn-sm btn-link px-0" onClick={() => setPreview(preview === video.id ? null : video.id)}>{preview === video.id ? 'Close preview' : 'Preview lesson'}</button>
            {preview === video.id && /^https:\/\/vimeo\.com\/\d+$/.test(video.video_url) && <iframe className="scholar-video-preview" src={`https://player.vimeo.com/video/${video.video_url.split('/').pop()}`} title={`Preview ${video.title}`} allow="fullscreen; picture-in-picture" allowFullScreen />}
          </div>
          <div className="scholar-lesson-actions">
            {!data.orderLocked && <div className="scholar-order-controls"><button className="btn btn-outline-secondary btn-sm" disabled={busy || index === 0} aria-label={`Move Up: ${video.title}`} onClick={() => move(index, -1)}><ArrowUp size={16} /> Move Up</button><button className="btn btn-outline-secondary btn-sm" disabled={busy || index === data.videos.length - 1} aria-label={`Move Down: ${video.title}`} onClick={() => move(index, 1)}><ArrowDown size={16} /> Move Down</button></div>}
            {Number(video.approved) !== 1 && <div className="d-flex gap-2"><button className="btn btn-outline-primary btn-sm" disabled={busy} onClick={() => setEditing({ ...video })}><Pencil size={15} /> Edit</button><button className="btn btn-outline-danger btn-sm" disabled={busy} aria-label={`Delete ${video.title}`} onClick={() => remove(video)}><Trash2 size={15} /> Delete</button></div>}
          </div>
        </li>)}</ol>}
      </section>
      {editing && <section className="scholar-section" aria-label="Edit lesson"><h2>Edit lesson details</h2><form onSubmit={save}>
        <VideoMetadataFields title={editing.title} description={editing.description} limits={data.limits} onTitleChange={title => setEditing({ ...editing, title })} onDescriptionChange={description => setEditing({ ...editing, description })} />
        <button className="btn btn-primary me-2" disabled={busy}>Save details</button><button className="btn btn-outline-secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
      </form></section>}
    </>}
  </main></div>;
}
