import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {securityHeaders} from '../scripts/build-security-headers.mjs';
import {pagedGet} from '../src/utils/pagedCollection.mjs';
import {observeCsp} from '../src/utils/cspObserver.mjs';
test('CSP enforces base protections and stages exact Stripe/Vimeo/API origins without script inline/eval',()=>{
 const headers=securityHeaders('<script type="application/ld+json">{"@type":"WebSite"}</script>');
 assert.match(headers,/Content-Security-Policy: base-uri 'self'; object-src 'none'; frame-ancestors 'self'/);
 assert.match(headers,/Content-Security-Policy-Report-Only:/);assert.match(headers,/sha256-/);
 const script=headers.match(/script-src ([^;\n]+)/)[1];assert.doesNotMatch(script,/unsafe-inline|unsafe-eval/);
 assert.match(headers,/https:\/\/player.vimeo.com/);assert.match(headers,/https:\/\/nyuniclips-26-prod-backend.onrender.com/);
 assert.doesNotMatch(headers,/https:\/\/\*\.onrender|report-uri|report-to/);
});
test('built structured-data changes require a different CSP hash',()=>{
 assert.notEqual(securityHeaders('<script type="application/ld+json">{"x":1}</script>'),securityHeaders('<script type="application/ld+json">{"x":2}</script>'));
});
test('CSP observer stores bounded directive counts without blocked URL/sample data',()=>{
 let handler;const observer=observeCsp({addEventListener:(_name,h)=>handler=h,removeEventListener(){}});
 for(let i=0;i<200;i++)handler({effectiveDirective:'script-src',disposition:'report',blockedURI:'https://private.invalid/?secret=PRIVATE',sample:'PRIVATE'});
 assert.deepEqual(observer.summary(),{'script-src:report':200});assert.doesNotMatch(JSON.stringify(observer.summary()),/PRIVATE|private.invalid/);observer.stop();
});
test('serial pages merge course lessons without losing auth, abort or response envelope',async()=>{
 const signal=new AbortController().signal,calls=[];
 const result=await pagedGet({async get(url,options){
  calls.push({url,options});return calls.length===1?{status:200,data:{videos:[{id:9},{id:8}],pagination:{hasMore:true,nextBefore:8}}}:{data:{videos:[{id:7}],pagination:{hasMore:false,nextBefore:null}}};
 }},'https://api.example.invalid/api/videos/all-videos',{signal,headers:{Authorization:'Bearer synthetic'}});
 assert.deepEqual(result.data.videos.map(v=>v.id),[9,8,7]);assert.equal(calls[1].options.params.before,8);
 assert.equal(calls[1].options.headers.Authorization,'Bearer synthetic');assert.equal(calls[1].options.signal.aborted,false);assert.equal(calls[1].options.timeout,15000);
});
test('pagination cursor loops, invalid responses and later-page failures cannot masquerade as complete data',async()=>{
 for(const invalid of [{hasMore:true,nextBefore:'8'},{hasMore:true,nextBefore:0},{hasMore:'yes',nextBefore:8}]){
  await assert.rejects(pagedGet({get:async()=>({data:{videos:[{id:8}],pagination:invalid}})},'/videos/all-videos'));
 }
 let calls=0;await assert.rejects(pagedGet({get:async()=>{if(++calls===2)throw Error('second page unavailable');return{data:{videos:[],pagination:{hasMore:true,nextBefore:8}}};}},'/videos/all-videos'));
 calls=0;await assert.rejects(pagedGet({get:async()=>({data:{videos:[{id:8}],pagination:{hasMore:true,nextBefore:8}}})},'/videos/all-videos'));
});
test('abort between pages stops additional requests without retry',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(pagedGet({get:async()=>{calls++;controller.abort();return{data:{videos:[{id:9}],pagination:{hasMore:true,nextBefore:9}}};}},'/videos/all-videos',{signal:controller.signal}),e=>e.code==='ERR_CANCELED');
 assert.equal(calls,1);
});
test('library page size matches server maximum and old accepted backend remains compatible',async()=>{
 let options;const response=await pagedGet({get:async(_url,o)=>{options=o;return{data:{library:[{id:7}]}};}},'/library/my-library');
 assert.equal(options.params.limit,50);assert.equal(response.data.library.length,1);
});
test('non-collection player and financial requests retain their exact options and single call',async()=>{
 const options={params:{subjectId:10},headers:{Authorization:'Bearer synthetic'}};
 let called=0;await pagedGet({get:async(url,o)=>{called++;assert.equal(url,'/videos/watch/101');assert.equal(o,options);return{};}},'/videos/watch/101',options);
 assert.equal(called,1);
});
test('frontend source has pagination at every active full-collection consumer',()=>{
 for(const file of ['components/featured-courses/FeaturedCourses.jsx','pages/PlayListPage.jsx','pages/VideoPlaylist.jsx','pages/WatchVideo.jsx','pages/CourseDetail.jsx','pages/MyLibrary.jsx','pages/dashboard/dashboardUser.jsx','pages/dashboard/components/tabs.jsx']){
  const source=fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8');assert.match(source,/pagedGet/);assert.doesNotMatch(source,/axios\.get\(/);
 }
});

test('changed browser paths never serialize raw Axios/player errors and library failure is explicit',()=>{
 for(const file of ['components/featured-courses/FeaturedCourses.jsx','pages/CourseDetail.jsx','pages/WatchVideo.jsx','pages/PlayListPage.jsx','pages/MyLibrary.jsx','pages/dashboard/newCourse.jsx','pages/dashboard/becomeScholar.jsx']){const s=fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8');assert.doesNotMatch(s,/console\.error\([^;\n]*,\s*err\)|\.catch\(console\.error\)/);}
 const library=fs.readFileSync(new URL('../src/pages/MyLibrary.jsx',import.meta.url),'utf8');assert.match(library,/Your library is temporarily unavailable/);const netlify=fs.readFileSync(new URL('../netlify.toml',import.meta.url),'utf8');assert.match(netlify,/Strict-Transport-Security/);
});

test('frontend-first release can read the old backend larger unpaginated collection safely',async()=>{
 const items=Array.from({length:150},(_,id)=>({id:id+1}));const result=await pagedGet({get:async()=>({data:{videos:items}})},'/videos/all-videos');assert.equal(result.data.videos.length,150);
});

import {buildCatalog,withProgress} from '../src/pages/dashboard/learnerData.mjs';
test('ordered cursor pages preserve higher IDs on later older-date pages and clean caller page controls',async()=>{
 const calls=[];const result=await pagedGet({get:async(url,options)=>{
  calls.push({url,options});return calls.length===1?{data:{videos:[{id:1}],pagination:{hasMore:true,nextBefore:1,nextCursor:'opaque_1'}}}:{data:{videos:[{id:9}],pagination:{hasMore:false,nextCursor:null}}};
 }},'/videos/all-videos?limit=1&before=9&cursor=old&category=general',{params:{before:10,cursor:'old',limit:1},headers:{Authorization:'Bearer synthetic'}});
 assert.deepEqual(result.data.videos.map(v=>v.id),[1,9]);assert.equal(calls[1].options.params.cursor,'opaque_1');assert.equal('before' in calls[1].options.params,false);
 assert.match(calls[0].url,/category=general/);assert.doesNotMatch(calls[0].url,/before=|cursor=|limit=/);
});
test('duplicate records after library or review movement fail clearly rather than inflate counts',async()=>{
 let n=0;await assert.rejects(pagedGet({get:async()=>({data:{library:[{id:7}],pagination:++n===1?{hasMore:true,nextCursor:'first'}:{hasMore:false}}})},'/library/my-library'),e=>e.code==='COLLECTION_CHANGED');assert.equal(n,2);
});
test('collection total deadline bounds many successful pages and prevents partial totals',async()=>{
 const old=Date.now;let clock=old(),calls=0;Date.now=()=>clock;
 try{await assert.rejects(pagedGet({get:async()=>{calls++;clock+=31000;return{data:{videos:[{id:100-calls}],pagination:{hasMore:true,nextBefore:100-calls}}};}},'/videos/all-videos'),e=>e.code==='COLLECTION_TIMEOUT');assert.equal(calls,2);}finally{Date.now=old;}
});
test('paged catalogue aggregation preserves course lesson sequence, recency and complete progress',async()=>{
 let calls=0;const r=await pagedGet({get:async()=>({data:{videos:++calls===1?[{id:20,subject_id:10,scholar_user_id:7,approved:1,sequence_index:2,created_at:'2026-02-02'}]:[{id:10,subject_id:10,scholar_user_id:7,approved:1,sequence_index:1,created_at:'2026-02-01'},{id:30,subject_id:20,scholar_user_id:8,approved:1,sequence_index:1,created_at:'2026-01-01'}],pagination:calls===1?{hasMore:true,nextCursor:'page_one'}:{hasMore:false}}})},'/videos/all-videos');
 const catalog=buildCatalog(r.data.videos);assert.deepEqual(catalog.map(c=>c.subjectId),[10,20]);assert.deepEqual(catalog[0].videos.map(v=>v.id),[10,20]);
 const p=withProgress(catalog[0],[{video_id:20,watched:1},{video_id:10,watched:1}]);assert.equal(p.progress.percent,100);assert.equal(p.progress.total,2);assert.equal(withProgress(catalog[0],null).progress,null);
});
test('active Scholar upload form reads the whole paginated own-video list before calculating limits',()=>{
 const s=fs.readFileSync(new URL('../src/pages/dashboard/VideoUploadPage.jsx',import.meta.url),'utf8');
 assert.match(s,/const videosRes = await pagedGet\(axios,/);assert.match(s,/setVideosLoaded\(true\)/);assert.match(s,/Please refresh before uploading|Please refresh before uploading/i);
});
