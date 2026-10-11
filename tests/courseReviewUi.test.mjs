import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

// Synthetic DOM/API only. No production account, player, provider or database.
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const k of ['window','document','HTMLElement','Element','Node','MutationObserver','getComputedStyle'])globalThis[k]=dom.window[k];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,within,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {MemoryRouter,Routes,Route}=await import('react-router-dom');
const axios=createRequire(import.meta.url)('axios');
const h=React.createElement;
const artifact=path.resolve('.test-artifacts/course-review-ui.cjs');
await build({stdin:{contents:"export {default as ManageCourse} from './src/pages/dashboard/ManageCourse.jsx';export {default as Approvals} from './src/pages/operations/Approvals.jsx';export {default as CourseReviews} from './src/pages/operations/CourseReviews.jsx';export {default as Workspace} from './src/pages/operations/Workspace.jsx';",resolveDir:process.cwd(),loader:'jsx'},outfile:artifact,bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',define:{'import.meta.env.VITE_API_URL':JSON.stringify('http://localhost:3001/api')},loader:{'.css':'empty'},plugins:[{name:'synthetic-auth-and-no-player',setup(b){
 b.onResolve({filter:/context\/temp$/},()=>({path:'auth',namespace:'fixture'}));
 b.onResolve({filter:/components\/ReviewPlayer$/},()=>({path:'player',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({loader:'jsx',resolveDir:process.cwd(),contents:a.path==='auth'?"const user={token:'SYNTHETIC_UI_TOKEN'};export function useAuth(){return {user};}":"export default function ReviewPlayer(){return <p>Player excluded from synthetic UI tests</p>;}"}));
}}]});
const {ManageCourse,Approvals,CourseReviews,Workspace}=createRequire(import.meta.url)(artifact);
let calls=[],course,detail,queue,submitError,denied=false,delaySubmit;
function reset(){
 calls=[];submitError=null;denied=false;delaySubmit=null;
 course={course:{course_name:'Synthetic Finnish',degree:'Synthetic degree'},videos:[{id:101,title:'Introduction',description:'A genuine course introduction',sequence_index:1,approved:0}],workflow:{state:'DRAFT',revision:0,feedback:null},editable:true,orderLocked:false,limits:{maxVideos:12,titleMin:3,titleMax:100,descriptionMin:8,descriptionMax:2000}};
 detail={offeringId:18,courseName:'Synthetic Calculus',workflow:{state:'SUBMITTED_FOR_REVIEW',revision:1,feedback:null},videos:[{id:201,title:'Introduction',description:'Synthetic lesson',sequence_index:1}]};
 queue=[{id:18,course:'Synthetic Calculus',fname:'Test',lname:'Scholar',lesson_count:1,state:'SUBMITTED_FOR_REVIEW'}];
}
async function request(url,method='GET',body){
 assert.equal(new URL(url).origin,'http://localhost:3001','no external network permitted');
 const p=new URL(url).pathname;calls.push({p,method,body});
 if(p==='/api/videos/scholar/courses/10'&&method==='GET')return structuredClone(course);
 if(p.endsWith('/submit')&&method==='POST'){
  if(delaySubmit)await delaySubmit;
  if(submitError)throw Object.assign(Error(submitError),{response:{status:409,data:{message:submitError}}});
  course.workflow.state='SUBMITTED_FOR_REVIEW';course.editable=false;course.orderLocked=true;return {state:'SUBMITTED_FOR_REVIEW'};
 }
 if(p==='/api/operations/overview')return {courseApplications:1};
 if(p==='/api/operations/approvals/courses')return {rows:[{id:18,user_id:7,title:'Synthetic Calculus',fname:'Test',lname:'Scholar',approved:1,description:'Application details',degree:'Synthetic degree'}],total:1,page:1,limit:20};
 if(p==='/api/operations/course-workflows')return {rows:structuredClone(queue),total:queue.length};
 if(/^\/api\/operations\/course-workflows\/\d+$/.test(p)){
  if(denied)throw Object.assign(Error('Forbidden'),{status:403});
  return structuredClone(detail);
 }
 if(p.endsWith('/request-changes')&&method==='POST'){detail.workflow.state='CHANGES_REQUESTED';detail.workflow.feedback=body.reason;queue=[];return {state:'CHANGES_REQUESTED'};}
 if(p.endsWith('/publish')&&method==='POST'){assert.equal(body.confirmation,'PUBLISH COURSE 18');assert.equal(body.count,detail.videos.length);queue=[];return {state:'PUBLISHED'};}
 throw Error('Unexpected synthetic request '+method+' '+p);
}
axios.defaults.adapter=async c=>({data:await request(c.url,c.method.toUpperCase(),typeof c.data==='string'?JSON.parse(c.data):c.data),status:200,statusText:'OK',headers:{},config:c});
// Fetch must execute request before json so HTTP failures are represented correctly.
globalThis.fetch=async(url,o={})=>{try{const data=await request(url,o.method||'GET',o.body?JSON.parse(o.body):undefined);return {ok:true,json:async()=>data};}catch(e){return {ok:false,status:e.status||409,json:async()=>({message:e.message})};}};
afterEach(()=>cleanup());
function manage(){return render(h(MemoryRouter,{initialEntries:['/manage-course/10']},h(Routes,null,h(Route,{path:'/manage-course/:subjectId',element:h(ManageCourse)}))));}
async function openSubmit(label='Submit Course for Review'){
 const trigger=await screen.findByRole('button',{name:label});trigger.focus();fireEvent.click(trigger);
 const dialog=await screen.findByRole('dialog',{name:'Submit Synthetic Finnish for review?'});return {trigger,dialog};
}
test('submission confirmation is a centered portal with course/count, focus, Escape and cancel',async()=>{
 reset();const view=manage();const {trigger,dialog}=await openSubmit();
 assert.equal(view.container.contains(dialog),false);assert.ok(dialog.querySelector('.modal-dialog-centered'));assert.ok(dialog.querySelector('.modal-dialog-scrollable'));
 assert.ok(within(dialog).getByText('1 uploaded lesson'));assert.match(dialog.textContent,/locks uploading, editing, removal and reordering/);
 assert.ok(document.getElementById(dialog.getAttribute('aria-describedby')));
 await waitFor(()=>assert.ok(document.activeElement===within(dialog).getByRole('button',{name:'Cancel'})));
 view.container.querySelector('a').focus();await waitFor(()=>assert.ok(dialog.contains(document.activeElement)));
 fireEvent.keyDown(dialog,{key:'Escape',code:'Escape'});await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));assert.ok(document.activeElement===trigger);
 await openSubmit();fireEvent.click(screen.getByRole('button',{name:'Cancel'}));await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));
 assert.equal(calls.filter(c=>c.method==='POST').length,0);
});
test('one lesson can submit once; pending action disables controls and successful state locks editing',async()=>{
 reset();manage();const {dialog}=await openSubmit();let release;delaySubmit=new Promise(r=>release=r);
 const yes=within(dialog).getByRole('button',{name:'Yes, Submit Course'});fireEvent.click(yes);fireEvent.click(yes);
 await waitFor(()=>assert.equal(calls.filter(c=>c.method==='POST').length,1));assert.ok(screen.getByRole('button',{name:'Submitting...'}).disabled);assert.ok(screen.getByRole('button',{name:'Cancel'}).disabled);
 release();await screen.findByRole('heading',{name:'Status: Submitted for Review'});await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));
 assert.equal(screen.queryByRole('button',{name:'Edit'}),null);assert.equal(screen.queryByRole('button',{name:'Submit Course for Review'}),null);assert.equal(screen.queryByRole('link',{name:/Upload Video/}),null);
});
test('readiness rejection stays visible in modal and does not retry submission',async()=>{
 reset();submitError='Lesson 101 failed security verification; Admin review is required.';manage();const {dialog}=await openSubmit();
 fireEvent.click(within(dialog).getByRole('button',{name:'Yes, Submit Course'}));await within(dialog).findByRole('alert');
 assert.match(within(dialog).getByRole('alert').textContent,/Lesson 101/);assert.ok(screen.getByRole('heading',{name:'Status: Draft'}));
 assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.ok(!within(dialog).getByRole('button',{name:'Yes, Submit Course'}).disabled);
});
test('Changes Requested shows feedback, permits corrections and offers resubmission; Published stays locked',async()=>{
 reset();course.workflow.state='CHANGES_REQUESTED';course.workflow.feedback='Please expand the real course content.';manage();
 await screen.findByText(course.workflow.feedback);assert.ok(screen.getByRole('button',{name:'Edit'}));await openSubmit('Resubmit Course for Review');
 fireEvent.click(screen.getByRole('button',{name:'Yes, Submit Course'}));await screen.findByRole('heading',{name:'Status: Submitted for Review'});
 cleanup();reset();course.workflow.state='PUBLISHED';course.editable=false;course.orderLocked=true;manage();
 await screen.findByRole('heading',{name:'Status: Published'});assert.equal(screen.queryByRole('button',{name:'Edit'}),null);assert.equal(screen.queryByRole('button',{name:/Submit Course/}),null);
});
test('Admin Open review displays visible application details and routes exact offering to publication review',async()=>{
 reset();render(h(MemoryRouter,{initialEntries:['/?section=approvals&panel=courses']},h(Workspace)));
 fireEvent.click(await screen.findByRole('button',{name:'Open review'}));const dialog=await screen.findByRole('dialog',{name:'Synthetic Calculus'});
 assert.ok(within(dialog).getByText('Offering #18'));assert.ok(within(dialog).getByText('Application details'));assert.match(dialog.textContent,/Application status: Approved/);
 fireEvent.click(within(dialog).getByRole('button',{name:'Open course publication review'}));
 const review=await screen.findByRole('dialog',{name:'Synthetic Calculus'});await within(review).findByText(/uploaded lessons/);
 assert.ok(screen.getByRole('button',{name:'Course Review'}));assert.ok(within(review).getByText('Offering #18'));
 assert.ok(calls.some(c=>c.p.endsWith('/course-workflows/18')));assert.equal(calls.filter(c=>c.method==='POST').length,0);
});
test('submitted queue opens fresh status/count, sends meaningful Changes Requested feedback and refreshes queue',async()=>{
 reset();render(h(CourseReviews));fireEvent.click(await screen.findByRole('button',{name:'Inspect course'}));
 const dialog=await screen.findByRole('dialog',{name:'Synthetic Calculus'});fireEvent.click(await within(dialog).findByRole('button',{name:'Request Changes'}));
 const feedback='Please upload the remaining genuinely needed lessons before resubmitting.';
 fireEvent.change(within(dialog).getByRole('textbox',{name:'Feedback for the Scholar'}),{target:{value:feedback}});
 fireEvent.click(within(dialog).getByRole('button',{name:'Return for Changes'}));await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));
 assert.deepEqual(calls.find(c=>c.p.endsWith('/request-changes')).body,{reason:feedback});assert.equal(detail.workflow.feedback,feedback);
 await screen.findByText('No matching records.');
});
test('publication requires exact confirmation and fresh detail count; denied details expose no publish action',async()=>{
 reset();detail.videos.push({...detail.videos[0],id:202,sequence_index:2});render(h(CourseReviews,{offeringId:18}));
 fireEvent.click(await screen.findByRole('button',{name:'Publish complete course'}));const dialog=screen.getByRole('dialog',{name:'Publish complete course'});
 assert.match(dialog.textContent,/reviewed all 2 lessons/);const confirm=within(dialog).getByRole('button',{name:'Confirm'});assert.ok(confirm.disabled);
 fireEvent.change(within(dialog).getByRole('textbox'),{target:{value:'PUBLISH COURSE 18'}});fireEvent.click(confirm);
 await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));assert.equal(calls.find(c=>c.p.endsWith('/publish')).body.count,2);
 cleanup();reset();denied=true;render(h(CourseReviews,{offeringId:18}));await screen.findByRole('alert');assert.equal(screen.queryByRole('button',{name:'Publish complete course'}),null);assert.equal(calls.filter(c=>c.method==='POST').length,0);
});
