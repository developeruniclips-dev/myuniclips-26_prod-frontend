import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { requestTaskCard } from '../src/utils/taskCardDownload.mjs';
test('private task-card UI uses an authenticated API download and revokes object URLs',()=>{
 const component=fs.readFileSync(new URL('../src/components/PrivateTaskCard.jsx',import.meta.url),'utf8');
 assert.match(component,/requestTaskCard/);assert.match(component,/revokeObjectURL/);assert.doesNotMatch(component,/task_card_url|window\.open/);
 const review=fs.readFileSync(new URL('../src/pages/operations/Approvals.jsx',import.meta.url),'utf8');assert.match(review,/<PrivateTaskCard/);assert.doesNotMatch(review,/href=\{row\.task_card_url\}/);
});
test('video form supplies the pre-parser course identifier while retaining multipart metadata',()=>{const source=fs.readFileSync(new URL('../src/pages/dashboard/VideoUploadPage.jsx',import.meta.url),'utf8');assert.match(source,/videos\?subjectId=\$\{encodeURIComponent\(subjectId\)\}/);assert.match(source,/formData\.append\("subjectId", subjectId\)/);});
test('document fetch sends bearer only in headers to the fixed authorized route, with no cache',async()=>{
 const signal=new AbortController().signal;let calls=0;
 const result=await requestTaskCard({api:'https://api.example.invalid/api',userId:7,token:'synthetic-bearer',signal,fetcher:async(url,options)=>{calls++;assert.equal(url,'https://api.example.invalid/api/scholar-profile/7/task-card');assert.equal(options.headers.Authorization,'Bearer synthetic-bearer');assert.equal(options.signal,signal);assert.equal(options.cache,'no-store');return new Response('synthetic-pdf',{status:200,headers:{'Content-Type':'application/pdf'}});}});
 assert.equal(result.extension,'pdf');assert.equal(await result.blob.text(),'synthetic-pdf');assert.equal(calls,1);
});
test('unauthorized/error/HTML/oversized responses and invalid identifiers never become downloads',async()=>{
 const options={api:'https://api.example.invalid/api',userId:7,token:'synthetic-bearer'};
 for(const response of [new Response('{}',{status:401}),new Response('raw private error',{status:503}),new Response('<script>bad</script>',{headers:{'Content-Type':'text/html'}}),new Response('x',{headers:{'Content-Type':'application/pdf','Content-Length':String(6*1024*1024)}})])await assert.rejects(requestTaskCard({...options,fetcher:async()=>response}),/^Error: Document unavailable$/);
 for(const userId of ['../8',0,[],{},'8?token=bad'])await assert.rejects(requestTaskCard({...options,userId,fetcher:()=>{throw Error('must not fetch');}}),/^Error: Document unavailable$/);
});
