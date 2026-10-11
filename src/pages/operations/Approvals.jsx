import {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import PrivateTaskCard from '../../components/PrivateTaskCard';
import CourseReviews from './CourseReviews';
import {Badge,ConfirmAction,date,Notice,Pager,query,Search,Table,useApi,useResource} from './common';
export default function Approvals({kind,openPerson,owner,offeringId,onOpenCourse}){
 return kind==='videos'?<CourseReviews owner={owner} offeringId={offeringId}/>:<ApplicationApprovals kind={kind} openPerson={openPerson} onOpenCourse={onOpenCourse}/>;
}
function ApplicationApprovals({kind,openPerson,onOpenCourse}){
 const [page,setPage]=useState(1),[q,setQ]=useState(''),[status,setStatus]=useState('pending'),[selected,setSelected]=useState(null),[decision,setDecision]=useState(null);
 const api=useApi(),resource=useResource('/operations/approvals/'+kind+'?'+query({page,q,status})),counts=useResource('/operations/overview'),countKey={scholars:'scholarApplications',courses:'courseApplications'}[kind];
 const close=()=>{setSelected(null);setDecision(null);};
 const course=kind==='courses';
 return <><div className="ops-section-heading"><h2>{course?'Course applications':'Scholar applications'}</h2><Badge>{counts.data?counts.data[countKey]+' pending':'Count unavailable'}</Badge></div>
 {course&&<p>Course applications approve a Scholar to teach a subject. They do not publish lessons. Submitted lessons are reviewed in <button className="ops-link" onClick={()=>onOpenCourse?.()}>Course Review</button>.</p>}
 <div className="ops-filters"><Search onSearch={value=>{setQ(value);setPage(1);close();}}/><select aria-label="Approval status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);close();}}><option value="pending">Pending</option><option value="approved">Approved</option><option value="all">All</option></select></div>
 <Notice {...resource}><Table rows={resource.data?.rows} columns={[
 ['Applicant',r=><button className="ops-link" onClick={()=>openPerson(r.user_id)}>{r.fname} {r.lname}<small>{r.email}</small></button>],
 ['Application',r=><>{r.title||r.university}<small>{r.course||r.degree}</small>{course&&<small>Offering #{r.id}</small>}</>],
 ['Status',r=><Badge>{r.approved?'Approved':'Pending'}</Badge>],['Submitted',r=>date(r.created_at)],
 ['Review',r=><button aria-haspopup="dialog" onClick={()=>setSelected(r)}>Open review</button>]
 ]}/><Pager data={resource.data} setPage={n=>{setPage(n);close();}}/></Notice>
 <Modal show={!!selected&&!decision} onHide={close} centered scrollable size="lg" aria-labelledby="application-review-title">
 {selected&&<><Modal.Header closeButton><Modal.Title id="application-review-title">{selected.title||selected.fname+' '+selected.lname}</Modal.Title></Modal.Header>
 <Modal.Body><p>{course?'Offering':'Application'} #{selected.id}</p><p>Application status: <Badge>{selected.approved?'Approved':'Pending'}</Badge></p>
 <p>{selected.university||selected.course} | {selected.degree}</p>{selected.year&&<p>Study year: {selected.year}</p>}
 <p className="ops-prose">{selected.expertise||selected.description||'No description provided.'}</p>
 {selected.task_card_url&&<PrivateTaskCard key={selected.user_id} userId={selected.user_id}/>}
 {course&&<><p>Application approval is separate from Draft, Submitted, Changes Requested and Published lesson status.</p><button className="btn btn-outline-primary" onClick={()=>{const id=selected.id;close();onOpenCourse?.(id);}}>Open course publication review</button></>}
 </Modal.Body><Modal.Footer>{!selected.approved&&<><button className="btn btn-primary" onClick={()=>setDecision('approve')}>Approve application</button><button className="btn btn-outline-danger" onClick={()=>setDecision('reject')}>Reject application</button></>}<button className="btn btn-outline-secondary" onClick={close}>Close review</button></Modal.Footer></>}
 </Modal>
 {decision&&selected&&<ConfirmAction title={decision==='approve'?'Approve this application':'Reject this application'} phrase={decision.toUpperCase()+' '+selected.id} explanation="This changes the teaching application approval only. It does not submit or publish course lessons. Rejection is blocked when protected references exist." onClose={()=>setDecision(null)} onConfirm={async()=>{await api('/operations/approvals/'+kind+'/'+selected.id,'POST',{decision});close();resource.reload();counts.reload();}}/>}</>;
}
