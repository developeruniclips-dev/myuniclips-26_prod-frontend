import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import path from 'node:path';
import {createRequire} from 'node:module';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Element','Node','MutationObserver','getComputedStyle'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react'),{render,screen,waitFor,cleanup}=await import('@testing-library/react'),{MemoryRouter}=await import('react-router-dom');
const req=createRequire(import.meta.url),axios=req('axios'),artifact=path.resolve('.test-artifacts/p2i-upload-ui.cjs');
await build({entryPoints:['src/pages/dashboard/VideoUploadPage.jsx'],outfile:artifact,bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',define:{'import.meta.env.VITE_API_URL':JSON.stringify('http://localhost:3001/api')},loader:{'.css':'empty'},plugins:[{name:'synthetic-auth',setup(b){
 b.onResolve({filter:/context\/temp$/},()=>({path:'auth',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'jsx',contents:"const user={token:'SYNTHETIC_TOKEN'};export function useAuth(){return {user};}"}));
}}]});
const Upload=req(artifact).default,h=React.createElement;
for(const failSecond of [false,true])test('Scholar form '+(failSecond?'fails closed on later page failure':'uses complete lesson count and maximum sequence from both pages'),async()=>{
 let pages=0,calls=0;
 axios.defaults.adapter=async c=>{
  assert.equal(c.method,'get');assert.equal(new URL(c.url).origin,'http://localhost:3001');calls++;
  let data;const route=new URL(c.url).pathname;
  if(route.endsWith('/videos/limits'))data={maxVideos:12,titleMin:3,titleMax:100,descriptionMin:8,descriptionMax:2000};
  else if(route.endsWith('/scholar-subjects/status'))data={subjects:[{id:1,subject_id:10,subject_name:'Synthetic course',degree:'Synthetic degree',approved:1}]};
  else if(route.endsWith('/scholar/courses/10'))data={editable:true,workflow:{state:'DRAFT'}};
  else if(route.endsWith('/scholar/my-videos')){
   pages++;assert.equal(c.headers.Authorization,'Bearer SYNTHETIC_TOKEN');
   if(pages===2&&failSecond)throw Error('Synthetic page unavailable');
   data=pages===1?{videos:Array.from({length:100},(_,i)=>({id:i+100,subject_id:i<2?10:20,sequence_index:i<2?i+1:1})),pagination:{hasMore:true,nextCursor:'next_page'}}:{videos:[{id:1,subject_id:10,sequence_index:10}],pagination:{hasMore:false}};
   if(pages===2)assert.equal(c.params.cursor,'next_page');
  }else throw Error('Unexpected synthetic read');
  return{data,status:200,statusText:'OK',headers:{},config:c};
 };
 try{
  render(h(MemoryRouter,{initialEntries:['/upload-video?subject_id=10']},h(Upload)));
  if(failSecond){await screen.findByText(/Unable to load your course content/);assert.equal(screen.queryByText(/9 video slots remaining/),null);assert.ok(screen.getByRole('button',{name:'Upload Video'}).disabled);}
  else{await screen.findByText(/9 video slots remaining/);assert.match(screen.getByRole('option').textContent,/3\/12 videos/);assert.equal(screen.getByRole('spinbutton').value,'11');}
  await waitFor(()=>assert.equal(pages,2));assert.ok(calls<=5);
 }finally{cleanup();}
});
