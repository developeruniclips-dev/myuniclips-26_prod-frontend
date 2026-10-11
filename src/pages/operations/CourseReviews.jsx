import {useEffect,useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import ReviewPlayer from '../../components/ReviewPlayer';
import {workflowLabel} from '../../utils/reviewReadiness.mjs';
import {Badge,ConfirmAction,Notice,Table,Pager,useApi,useResource} from './common';
function CourseDetail({offeringId,course,owner,onSaved,onClose}){
 const api=useApi(),resource=useResource('/operations/course-workflows/'+offeringId),[selected,setSelected]=useState(null),[action,setAction]=useState(null),[reason,setReason]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const current=resource.data,workflow=current?.workflow;
 const state=workflow?.state,feedback=workflow?.feedback;
 const name=current?.courseName||course?.course||'Offering #'+offeringId;
 async function requestChanges(event){event.preventDefault();if(busy)return;setBusy(true);setError('');try{await api('/operations/course-workflows/'+offeringId+'/'+action,'POST',{reason});setAction(null);onSaved();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <><Modal show={action!=='publish'} onHide={busy?()=>{}:onClose} centered scrollable size="lg" backdrop={busy?'static':true} keyboard={!busy} aria-labelledby="course-review-title">
 <Modal.Header closeButton={!busy}><Modal.Title id="course-review-title">{name}</Modal.Title></Modal.Header>
 <Modal.Body><p>Offering #{offeringId}</p><Notice {...resource}>
 {current&&<><p>Status: <Badge>{workflowLabel(state)}</Badge> | {current.videos.length} uploaded lessons</p>{feedback&&<p className="ops-prose">Feedback: {feedback}</p>}
 <ol>{current.videos.map(v=><li key={v.id}><strong>Lesson {v.sequence_index}: {v.title}</strong><p>{v.description}</p><button onClick={()=>setSelected(selected===v.id?null:v.id)}>{selected===v.id?'Close preview':'Preview lesson'}</button>{selected===v.id&&<ReviewPlayer videoId={v.id} title={v.title}/>}</li>)}</ol>
 {state==='SUBMITTED_FOR_REVIEW'&&<div className="ops-actions"><button onClick={()=>setAction('publish')}>Publish complete course</button><button onClick={()=>setAction('request-changes')}>Request Changes</button>{owner&&<button onClick={()=>setAction('reopen')}>Reopen for Changes</button>}</div>}
 {['request-changes','reopen'].includes(action)&&<form onSubmit={requestChanges}><label>Feedback for the Scholar<textarea required minLength={8} maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={busy}>Return for Changes</button><button type="button" disabled={busy} onClick={()=>setAction(null)}>Cancel feedback</button></form>}</>}
 </Notice></Modal.Body><Modal.Footer><button className="btn btn-outline-secondary" disabled={busy} onClick={onClose}>Close course</button></Modal.Footer></Modal>
 {action==='publish'&&<ConfirmAction title="Publish complete course" phrase={'PUBLISH COURSE '+offeringId} explanation={'Confirm you reviewed all '+current.videos.length+' lessons, their content and order. This publishes the complete course. Prices and payment records stay unchanged.'} onClose={()=>setAction(null)} onConfirm={async confirmation=>{await api('/operations/course-workflows/'+offeringId+'/publish','POST',{confirmation,count:current.videos.length});setAction(null);onSaved();}}/>}</>;
}
export default function CourseReviews({owner,offeringId}){
 const [state,setState]=useState('SUBMITTED_FOR_REVIEW'),[selected,setSelected]=useState(offeringId||null),[page,setPage]=useState(1),resource=useResource('/operations/course-workflows?state='+state+'&page='+page);
 useEffect(()=>setSelected(offeringId||null),[offeringId]);
 const rows=resource.data?.rows||[];
 return <><h2>Course Review</h2><p>Review whole courses submitted for publication, request changes or publish after reviewing every lesson. Course Applications separately approve permission to teach. Draft uploads remain available for inspection using the status filter.</p>
 <label>Course status<select value={state} onChange={e=>{setState(e.target.value);setPage(1);setSelected(null);}}><option value="ALL">All courses</option>{['SUBMITTED_FOR_REVIEW','DRAFT','CHANGES_REQUESTED','PUBLISHED'].map(s=><option key={s} value={s}>{workflowLabel(s)}</option>)}</select></label>
 <Notice {...resource}><Table rows={rows} columns={[
 ['Course',r=><>{r.course}<small>{r.fname} {r.lname} | {r.lesson_count} lessons | Offering #{r.id}</small></>],
 ['Status',r=><Badge>{workflowLabel(r.state)}</Badge>],['Review',r=><button aria-haspopup="dialog" onClick={()=>setSelected(r.id)}>Inspect course</button>]
 ]}/><Pager data={resource.data} setPage={n=>{setPage(n);setSelected(null);}}/></Notice>
 {selected&&<CourseDetail key={selected} offeringId={selected} course={rows.find(r=>Number(r.id)===Number(selected))} owner={owner} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null);resource.reload();}}/>}</>;
}
