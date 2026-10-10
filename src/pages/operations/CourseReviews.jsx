import {useState} from 'react';
import ReviewPlayer from '../../components/ReviewPlayer';
import {workflowLabel} from '../../utils/reviewReadiness.mjs';
import {Badge,ConfirmAction,Notice,Table,Pager,useApi,useResource} from './common';
function CourseDetail({course,owner,onSaved}){
 const api=useApi(),resource=useResource(`/operations/course-workflows/${course.id}`),[selected,setSelected]=useState(null),[action,setAction]=useState(null),[reason,setReason]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function requestChanges(event){event.preventDefault();setBusy(true);setError('');try{await api(`/operations/course-workflows/${course.id}/${action}`,'POST',{reason});setAction(null);onSaved();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <section className="ops-inset"><h3>{course.course}</h3><Badge>{workflowLabel(course.state)}</Badge>{course.feedback&&<p className="ops-prose">{course.feedback}</p>}<Notice {...resource}><ol>{resource.data?.videos.map(v=><li key={v.id}><strong>Lesson {v.sequence_index}: {v.title}</strong><p>{v.description}</p><button onClick={()=>setSelected(selected===v.id?null:v.id)}>{selected===v.id?'Close review':'Open review'}</button>{selected===v.id&&<ReviewPlayer videoId={v.id} title={v.title}/>}</li>)}</ol></Notice>
 {course.state==='SUBMITTED_FOR_REVIEW'&&<div className="ops-actions"><button onClick={()=>setAction('publish')}>Publish complete course</button><button onClick={()=>setAction('request-changes')}>Request Changes</button>{owner&&<button onClick={()=>setAction('reopen')}>Reopen for Changes</button>}</div>}
 {action==='publish'&&<ConfirmAction title="Publish complete course" phrase={`PUBLISH COURSE ${course.id}`} explanation={`Confirm you reviewed all ${course.lesson_count} lessons, their content and order. This publishes the complete course. Prices and payment records stay unchanged.`} onClose={()=>setAction(null)} onConfirm={async confirmation=>{await api(`/operations/course-workflows/${course.id}/publish`,'POST',{confirmation,count:Number(course.lesson_count)});onSaved();}}/>}
 {['request-changes','reopen'].includes(action)&&<form onSubmit={requestChanges}><label>Feedback for the Scholar<textarea required minLength={8} maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={busy}>Return for Changes</button><button type="button" disabled={busy} onClick={()=>setAction(null)}>Cancel</button></form>}</section>;
}
export default function CourseReviews({owner}){
 const [state,setState]=useState('ALL'),[selected,setSelected]=useState(null),[page,setPage]=useState(1),resource=useResource(`/operations/course-workflows?state=${state}&page=${page}`);
 const rows=resource.data?.rows||[];
 return <><h2>Course review</h2><p>Submitted courses appear first. Draft uploads remain available for inspection.</p><label>Course status<select value={state} onChange={e=>{setState(e.target.value);setPage(1);setSelected(null);}}><option value="ALL">All courses</option>{['SUBMITTED_FOR_REVIEW','DRAFT','CHANGES_REQUESTED','PUBLISHED'].map(s=><option key={s} value={s}>{workflowLabel(s)}</option>)}</select></label><Notice {...resource}><Table rows={rows} columns={[
 ['Course',r=><>{r.course}<small>{r.fname} {r.lname} · {r.lesson_count} lessons</small></>],['Status',r=><Badge>{workflowLabel(r.state)}</Badge>],['Review',r=><button onClick={()=>setSelected(selected===r.id?null:r.id)}>{selected===r.id?'Close course':'Inspect course'}</button>]
 ]} expandedRow={r=>selected===r.id?<CourseDetail key={`${r.id}-${r.state}`} course={r} owner={owner} onSaved={()=>{setSelected(null);resource.reload();}}/>:null}/><Pager data={resource.data} setPage={n=>{setPage(n);setSelected(null);}}/></Notice></>;
}
