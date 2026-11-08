import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import path from 'node:path';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const k of ['window','document','HTMLElement','Element','Node','MutationObserver','getComputedStyle'])globalThis[k]=dom.window[k];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react'),{render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react'),{MemoryRouter,Routes,Route}=await import('react-router-dom');
const axios=createRequire(import.meta.url)('axios'),h=React.createElement,artifact=path.resolve('.test-artifacts/financial-presentation.cjs');
globalThis.PAYMENT_FIXTURE_USER={id:11,token:'synthetic-offline-session'};
await build({stdin:{contents:"export {default as CourseDetail} from './src/pages/CourseDetail.jsx';export {default as ScholarEarnings} from './src/pages/dashboard/components/ScholarEarnings.jsx';export {default as PurchaseHistory} from './src/pages/dashboard/components/PurchaseHistory.jsx';export {Finance} from './src/pages/operations/FinanceSystem.jsx';",resolveDir:process.cwd(),loader:'jsx'},outfile:artifact,bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',define:{'import.meta.env.VITE_API_URL':JSON.stringify('http://localhost:3001/api')},loader:{'.css':'empty','.png':'dataurl','.jpg':'dataurl'},plugins:[{name:'inert-auth-and-seo',setup(b){b.onResolve({filter:/context\/temp$/},()=>({path:'auth',namespace:'fixture'}));b.onResolve({filter:/components\/SEO$/},()=>({path:'seo',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({loader:'jsx',resolveDir:process.cwd(),contents:a.path==='auth'?"export function useAuth(){return {user:globalThis.PAYMENT_FIXTURE_USER};}":"export function CourseDetailSEO(){return null;}"}));}}]});
const {CourseDetail,ScholarEarnings,PurchaseHistory,Finance}=createRequire(import.meta.url)(artifact);
const originalGet=axios.get,originalPost=axios.post,originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();axios.get=originalGet;axios.post=originalPost;globalThis.fetch=originalFetch;});
function courseFixture(payment){const video={id:1,subject_id:123,scholar_user_id:7,approved:1,sequence_index:1,is_free:1,is_first_preview:1,title:'Preview',subject_name:'Synthetic Course',scholar_fname:'Synthetic',scholar_lname:'Scholar',payment};let posts=0;
 axios.get=async(url)=>{const p=new URL(url).pathname;if(p.endsWith('/videos/all-videos')||p.endsWith('/videos/courses/123/7'))return {data:{videos:[video]}};if(p.endsWith('/course-payments/offering'))return {data:{payment}};if(p.endsWith('/purchases/subject/check'))return {data:{hasPurchased:false,hasEverPurchased:false}};if(p.endsWith('/library/check'))return {data:{inLibrary:false}};throw Error('Unexpected offline GET '+p);};axios.post=async()=>{posts++;throw Error('No provider initiation allowed');};
 render(h(MemoryRouter,{initialEntries:['/course/123/7']},h(Routes,null,h(Route,{path:'/course/:subjectId/:scholarId',element:h(CourseDetail)}))));return()=>posts;
}
test('Nigerian course renders NGN/Paystack and disabled checkout with no payment initiation',async()=>{
 const posts=courseFixture({provider:'paystack',currency:'NGN',amountMinor:150000,checkoutEnabled:false,contextVersion:'ng'});
 const button=await screen.findByRole('button',{name:/Paystack.*Checkout unavailable/});assert.equal(button.disabled,true);assert.match(document.body.textContent,/1,500/);assert.equal(screen.getByRole('button',{name:/Watch Free Preview/}).disabled,false);fireEvent.click(button);assert.equal(posts(),0);
});
test('Finnish course retains its approved EUR price and enabled Stripe purchase button',async()=>{
 courseFixture({provider:'stripe',currency:'EUR',amountMinor:700,checkoutEnabled:true,contextVersion:'fi'});
 const button=await screen.findByRole('button',{name:/Unlock Full Course/});assert.equal(button.disabled,false);assert.match(button.textContent,/7\.00/);assert.doesNotMatch(button.textContent,/6\.00|NGN/);
});

test('explicit test-only NG offering enables the Paystack purchase button without inferring a live payment',async()=>{
 const posts=courseFixture({provider:'paystack',currency:'NGN',amountMinor:150000,checkoutEnabled:true,checkoutMode:'test',contextVersion:'ng'});
 const button=await screen.findByRole('button',{name:/Unlock Full Course/});assert.equal(button.disabled,false);assert.match(button.textContent,/1,500/);assert.equal(posts(),0);
});

test('Paystack return reconciles through authenticated backend and retains a pending state instead of trusting URL success',async()=>{
 const id='00000000-0000-0000-0000-000000000001';let verifies=0;
 axios.get=async url=>{const p=new URL(url).pathname;if(p.endsWith('/videos/all-videos')||p.endsWith('/videos/courses/123/7'))return {data:{videos:[{id:1,subject_id:123,scholar_user_id:7,approved:1,title:'Preview',sequence_index:1}]}};if(p.endsWith('/course-payments/offering'))return {data:{payment:{provider:'paystack',currency:'NGN',amountMinor:150000,checkoutEnabled:false,contextVersion:'ng'}}};if(p.endsWith('/purchases/subject/check'))return {data:{hasPurchased:false}};if(p.endsWith('/library/check'))return {data:{inLibrary:false}};throw Error('Unexpected GET');};
 axios.post=async(url,body,config)=>{assert.match(url,/\/course-payments\/verify$/);assert.deepEqual(body,{orderId:id});assert.match(config.headers.Authorization,/Bearer /);verifies++;return {data:{provider:'paystack',orderId:id,subjectId:123,scholarId:7,currency:'NGN',amountMinor:150000,state:'pending',success:false}};};
 render(h(MemoryRouter,{initialEntries:[`/course/123/7?payment=paystack&order=${id}&success=true&reference=forged`]},h(Routes,null,h(Route,{path:'/course/:subjectId/:scholarId',element:h(CourseDetail)}))));
 await screen.findByText(/Payment is pending verification/);assert.equal(verifies,1);assert.equal(screen.queryByText(/Payment verified/),null);fireEvent.click(screen.getByRole('button',{name:'Check payment status'}));await waitFor(()=>assert.equal(verifies,2));
});
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};}
function paidCourseReturn({staleInitial=false,purchased=true}={}){
 const orderId='00000000-0000-0000-0000-000000000002',verification=deferred(),initialCourse=deferred();let reads=0,verifies=0,confirmed=false;
 const videos=[{id:1,subject_id:123,scholar_user_id:7,approved:1,title:'Preview',sequence_index:1,is_first_preview:1},{id:2,subject_id:123,scholar_user_id:7,approved:1,title:'Paid lesson',sequence_index:2,is_first_preview:0}];
 axios.get=async(url,config)=>{const p=new URL(url).pathname;
  if(p.endsWith('/videos/all-videos'))return {data:{videos}};
  if(p.endsWith('/videos/courses/123/7')){reads++;assert.match(config.headers.Authorization,/Bearer /);if(staleInitial&&reads===1)return initialCourse.promise;return {data:{hasPurchased:purchased&&confirmed,videos:videos.map(v=>({...v,can_access:purchased&&confirmed||v.id===1}))}};}
  if(p.endsWith('/course-payments/offering'))return {data:{payment:{provider:'paystack',currency:'NGN',amountMinor:150000,checkoutEnabled:true,checkoutMode:'test',contextVersion:'ng'}}};
  if(p.endsWith('/purchases/subject/check'))return {data:{hasPurchased:false}};
  if(p.endsWith('/library/check'))return {data:{inLibrary:false}};
  throw Error('Unexpected offline GET');
 };
 axios.post=async(url,body)=>{assert.match(url,/\/course-payments\/verify$/);assert.deepEqual(body,{orderId});verifies++;return verification.promise;};
 render(h(MemoryRouter,{initialEntries:[`/course/123/7?payment=paystack&order=${orderId}&success=true`]},h(Routes,null,h(Route,{path:'/course/:subjectId/:scholarId',element:h(CourseDetail)}))));
 return {reads:()=>reads,verifies:()=>verifies,confirm:()=>{confirmed=true;verification.resolve({data:{provider:'paystack',orderId,subjectId:123,scholarId:7,currency:'NGN',amountMinor:150000,state:'fulfilled',success:true}});},releaseStale:()=>initialCourse.resolve({data:{hasPurchased:false,videos}})};
}

test('verified Paystack return retains authoritative purchased state after the course refresh',async()=>{
 const f=paidCourseReturn();await screen.findByRole('button',{name:/Unlock Full Course/});f.confirm();
 await screen.findByText(/Payment verified/);await waitFor(()=>assert.ok(f.reads()>=2));
 await screen.findByRole('button',{name:'Continue Learning'});assert.ok(screen.getByText('Course Purchased'));assert.equal(screen.queryByText('Requires Bundle'),null);assert.equal(screen.queryByRole('button',{name:/Unlock Full Course/}),null);assert.equal(f.verifies(),1);
});

test('a cancelled pre-verification course response cannot undo the refreshed entitlement',async()=>{
 const f=paidCourseReturn({staleInitial:true});await waitFor(()=>assert.equal(f.reads(),1));f.confirm();
 await screen.findByRole('button',{name:'Continue Learning'});await React.act(async()=>{f.releaseStale();});
 assert.ok(screen.getByText('Course Purchased'));assert.equal(screen.queryByText('Requires Bundle'),null);assert.equal(f.verifies(),1);
});

test('fulfilled payment does not override a current course response denying active access',async()=>{
 const f=paidCourseReturn({purchased:false});await screen.findByRole('button',{name:/Unlock Full Course/});f.confirm();
 await screen.findByText(/Payment verified/);await waitFor(()=>assert.ok(f.reads()>=2));await screen.findByText('Requires Bundle');
 assert.equal(screen.queryByRole('button',{name:'Continue Learning'}),null);assert.equal(screen.queryByText('Course Purchased'),null);
});

test('held Nigerian earnings are separate from EUR and expose no Stripe payout control',()=>{
 render(h(ScholarEarnings,{countryCode:'NG',token:'synthetic',stripe:null,data:{summary:{currency:'EUR',totalSales:0},breakdowns:[{entity:'UNICLIPS_NIGERIA_LIMITED',provider:'paystack',currency:'NGN',scholarMinor:75000,recordedGrossMinor:150000,unreconciledSales:0}],salesByCourse:[],payoutHistory:[]}}));
 assert.match(document.body.textContent,/NGN.*paystack/);assert.match(document.body.textContent,/Held.*no automatic payouts/);assert.equal(screen.queryByRole('button',{name:/Stripe/}),null);
});

test('existing Stripe account management survives an academic country change without enabling NG payouts',()=>{
 render(h(ScholarEarnings,{countryCode:'NG',token:'synthetic',stripe:{connected:true,onboardingComplete:true},data:{summary:{currency:'EUR',totalSales:0},breakdowns:[{entity:'UNICLIPS_NIGERIA_LIMITED',provider:'paystack',currency:'NGN',scholarMinor:75000,recordedGrossMinor:150000,unreconciledSales:0}],salesByCourse:[],payoutHistory:[]}}));
 assert.ok(screen.getByRole('button',{name:'Manage Stripe account'}));assert.match(document.body.textContent,/Held.*no automatic payouts/);assert.equal(screen.queryByRole('button',{name:/Release|Paystack/}),null);
});
test('owned purchase receipt uses recorded NGN amount/provider, never the current EUR course price',async()=>{
 axios.get=async()=>({data:{purchases:[{purchase_id:1,course_name:'Historical course',amount:'1500.00',currency:'NGN',provider:'paystack',entity:'UNICLIPS_NIGERIA_LIMITED',verificationState:'verified',payment_reference:'psng-owned'}]}});
 render(h(PurchaseHistory,{token:'synthetic'}));await screen.findByText('psng-owned');assert.match(document.body.textContent,/1,500\.00/);assert.match(document.body.textContent,/paystack/);assert.doesNotMatch(document.body.textContent,/EUR|€6/);
});
test('Operations never offers Stripe release for held Nigerian allocation, even with forged pending flags',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>({available:true,total:1,page:1,limit:20,rows:[{id:'ng-order',provider:'paystack',currency:'NGN',scholar:'Synthetic',course:'NG Course',scholar_minor:75000,gross_minor:150000,sale_ordinal:101,scholar_rate:50,transfer_state:'pending',payout_state:'held',refund_state:'none',dispute_state:'none',canReleaseStripe:true}]})});
 render(h(Finance));await screen.findByText('NG Course');assert.equal(screen.queryByRole('button',{name:'Review release'}),null);assert.match(document.body.textContent,/held/);
});
