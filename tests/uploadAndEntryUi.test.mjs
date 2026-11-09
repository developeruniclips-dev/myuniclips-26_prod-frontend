import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';import {build} from 'esbuild';import path from 'node:path';import {createRequire} from 'node:module';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Element','Node','MutationObserver','getComputedStyle','File','FormData'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react'),{render,screen,within,fireEvent,waitFor,cleanup,act}=await import('@testing-library/react'),{MemoryRouter,Routes,Route,useLocation}=await import('react-router-dom');
const req=createRequire(import.meta.url),axios=req('axios'),h=React.createElement,artifact=path.resolve('.test-artifacts/upload-entry-ui.cjs');
await build({stdin:{contents:"export {default as Hero} from './src/components/hero/Hero.jsx';export {default as Steps} from './src/components/how-it-works/HowItWorks.jsx';export {default as Nav} from './src/components/navbar/TopNavBar.jsx';export {default as CTA} from './src/components/cta/CallToAction.jsx';export {default as Upload} from './src/pages/dashboard/VideoUploadPage.jsx';export {default as Player} from './src/components/ReviewPlayer.jsx';",loader:'jsx',resolveDir:process.cwd()},outfile:artifact,bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',define:{'import.meta.env.VITE_API_URL':JSON.stringify('http://localhost:3001/api')},loader:{'.css':'empty','.jpg':'dataurl'},plugins:[{name:'synthetic-auth',setup(b){b.onResolve({filter:/context\/temp$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'jsx',contents:'export function useAuth(){return {user:globalThis.__ENTRY_USER,logout:async()=>false};}'}));}}]});
const {Hero,Steps,Nav,CTA,Upload,Player}=req(artifact);afterEach(()=>{cleanup();globalThis.__ENTRY_USER=null;});
function target(){const l=useLocation();return h('p',null,'Destination '+l.pathname+' '+String(l.state?.uploadSaved===true));}
function home(Component){return render(h(MemoryRouter,null,h(Routes,null,h(Route,{path:'/',element:h(Component)}),h(Route,{path:'*',element:h(target)}))));}
test('homepage offers direct signup/login entry and each numbered action is an actual working link',async()=>{
 globalThis.__ENTRY_USER=null;home(Hero);const signup=screen.getByRole('link',{name:'Sign up free'});assert.equal(signup.getAttribute('href'),'/register');assert.equal(screen.getByRole('link',{name:/Login.*continue where you left off/}).getAttribute('href'),'/login');fireEvent.click(signup);await screen.findByText('Destination /register false');cleanup();
 for(const [name,to]of [['Create Your Account','/register'],['Browse Courses','/all-videos'],['Start Learning','/all-videos']]){home(Steps);fireEvent.click(screen.getByRole('link',{name:new RegExp(name)}));await screen.findByText('Destination '+to+' false');cleanup();}
});
test('CTA signup is a single semantic link and navigation exposes signup on mobile and desktop',async()=>{
 globalThis.__ENTRY_USER=null;home(CTA);const signup=screen.getByRole('link',{name:/Sign Up Free/});assert.equal(signup.querySelector('button'),null);fireEvent.click(signup);await screen.findByText('Destination /register false');cleanup();
 home(Nav);const toggle=screen.getByRole('button',{name:'Toggle navigation'});fireEvent.click(toggle);assert.equal(toggle.getAttribute('aria-expanded'),'true');fireEvent.click(screen.getByRole('link',{name:'Sign Up'}));await screen.findByText('Destination /register false');
});
async function uploadForm(){
 globalThis.__ENTRY_USER={token:'SYNTHETIC_UI_TOKEN',roles:['Scholar']};let post,finish;const pending=new Promise(r=>finish=r);
 axios.defaults.adapter=async c=>{let data;const p=new URL(c.url).pathname;
  if(c.method==='post'){assert.equal(post,undefined,'no duplicate upload POST');post=c;const response=await pending;return {data:response,status:201,statusText:'Created',headers:{},config:c};}
  if(p.endsWith('/videos/limits'))data={maxVideos:12,maxVideoBytes:1073741824,maxTitleCharacters:200,maxDescriptionCharacters:10000};
  else if(p.endsWith('/scholar-subjects/status'))data={subjects:[{id:1,subject_id:10,subject_name:'Synthetic course',degree:'Synthetic degree',approved:1}]};
  else if(p.endsWith('/scholar/my-videos'))data={videos:[],pagination:{hasMore:false}};
  else if(p.endsWith('/scholar/courses/10'))data={editable:true,workflow:{state:'DRAFT'}};else assert.fail('Unexpected synthetic request');
  return {data,status:200,statusText:'OK',headers:{},config:c};
 };
 render(h(MemoryRouter,{initialEntries:['/upload-video?subject_id=10']},h(Routes,null,h(Route,{path:'/upload-video',element:h(Upload)}),h(Route,{path:'*',element:h(target)}))));
 await screen.findByText(/12 video slots remaining/);fireEvent.change(screen.getByLabelText(/Video File/),{target:{files:[new File(['synthetic'],'fixture.mp4',{type:'video/mp4'})]}});fireEvent.change(screen.getByRole('textbox',{name:/Video Title/}),{target:{value:'Synthetic lesson'}});
 fireEvent.click(screen.getByRole('checkbox',{name:/I agree to/}));const modal=await screen.findByRole('dialog');fireEvent.click(within(modal).getByRole('checkbox'));fireEvent.click(within(modal).getByRole('button',{name:'Accept & Continue'}));await waitFor(()=>assert.ok(!screen.queryByRole('dialog')));
 const button=screen.getByRole('button',{name:'Upload Video'});await waitFor(()=>assert.equal(button.disabled,false));fireEvent.submit(button.closest('form'));fireEvent.submit(button.closest('form'));await waitFor(()=>assert(post));return {get post(){return post;},finish};
}
test('upload shows real byte progress and waits for acknowledgement before reporting saved draft',{timeout:15000},async()=>{
 const f=await uploadForm();const bar=screen.getByRole('progressbar',{name:'Video upload progress'});assert.equal(bar.getAttribute('aria-valuenow'),'0');
 await act(async()=>f.post.onUploadProgress({loaded:45,total:100}));assert.equal(bar.getAttribute('aria-valuenow'),'45');
 await act(async()=>f.post.onUploadProgress({loaded:100,total:100}));assert.equal(bar.getAttribute('aria-valuenow'),'99');assert.ok(screen.getByText(/Finishing the transfer and saving your draft/));assert.equal(screen.queryByText(/Destination/),null);assert.ok(screen.getByLabelText(/Video File/).closest('fieldset').disabled);
 await act(async()=>f.finish({uploadAccepted:true}));await screen.findByText('Destination /manage-course/10 true');
});
test('an ambiguous acknowledgement cannot claim success or automatically retry the upload',{timeout:15000},async()=>{
 const f=await uploadForm();await act(async()=>f.post.onUploadProgress({loaded:100,total:100}));await act(async()=>f.finish({}));
 await screen.findByText(/could not confirm that your upload was saved/);assert.equal(screen.queryByText(/Destination/),null);assert.equal(screen.queryByRole('progressbar'),null);
});
test('preparing video explains the wait and manual readiness refresh only reveals an approved player',{timeout:15000},async()=>{
 globalThis.__ENTRY_USER={token:'SYNTHETIC_UI_TOKEN'};let reads=0;axios.defaults.adapter=async c=>{assert.equal(c.method,'get');reads++;return {data:reads===1?{state:'PROCESSING',policyVerified:true}:{state:'READY',policyVerified:true,player_url:'https://player.vimeo.com/video/123'},status:200,statusText:'OK',headers:{},config:c};};
 render(h(Player,{videoId:88,title:'Dynamics introduction'}));await screen.findByText(/draft is saved/);assert.ok(screen.getByText(/longer for large videos/));assert.equal(document.querySelector('iframe'),null);
 fireEvent.click(screen.getByRole('button',{name:'Check readiness again'}));await screen.findByTitle('Review Dynamics introduction');assert.equal(reads,2);
});
