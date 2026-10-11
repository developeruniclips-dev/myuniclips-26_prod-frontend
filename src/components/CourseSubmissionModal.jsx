import {useId,useRef} from 'react';
import Modal from 'react-bootstrap/Modal';
export default function CourseSubmissionModal({courseName,lessonCount,busy,error,onCancel,onSubmit}){
 const id=useId(),cancel=useRef(null);
 return <Modal show centered scrollable onHide={busy?()=>{}:onCancel} keyboard={!busy} backdrop={busy?'static':true}
  aria-labelledby={id+'-title'} aria-describedby={id+'-description'} onEntered={()=>cancel.current?.focus()}>
  <Modal.Header closeButton={!busy}><Modal.Title id={id+'-title'}>Submit {courseName} for review?</Modal.Title></Modal.Header>
  <Modal.Body><p><strong>{lessonCount} uploaded {lessonCount===1?'lesson':'lessons'}</strong></p>
   <p id={id+'-description'}>Submitting locks uploading, editing, removal and reordering until the Admin responds. If changes are requested, you can correct the course and resubmit.</p>
   <p>Check the content and lesson order before submitting. The Admin decides whether the lessons cover the course sufficiently. You do not need to fill every available upload slot.</p>
   {error&&<p role="alert" className="alert alert-danger">{error}</p>}
  </Modal.Body>
  <Modal.Footer><button ref={cancel} type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onCancel}>Cancel</button>
   <button type="button" className="btn btn-primary" disabled={busy||lessonCount<1} onClick={onSubmit}>{busy?'Submitting...':'Yes, Submit Course'}</button></Modal.Footer>
 </Modal>;
}
