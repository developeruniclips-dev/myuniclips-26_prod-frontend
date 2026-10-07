import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import axios from 'axios';
import {createAuthSession,secondsRemaining} from '../src/utils/authSession.mjs';
import {setupAxiosInterceptor} from '../src/utils/axiosInterceptor.js';
const token=expiry=>`synthetic.${Buffer.from(JSON.stringify({exp:expiry})).toString('base64url')}.signature`;
const valid=label=>token(Math.floor(Date.now()/1000)+3600)+label;
function harness(request){let user={id:7,roles:['Learner'],token:valid('old'),refreshToken:'synthetic-refresh'};let clears=0;const session=createAuthSession({request,read:()=>user,write:value=>{user=value;},clear:()=>{user=null;clears++;}});return{session,read:()=>user,replace:value=>{user=value;},clears:()=>clears};}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
test('issued token exchange is retained; challenge-only envelopes cannot become signed-in users',()=>{
 const h=harness(()=>{});assert.throws(()=>h.session.store({requires2FA:true,challengeToken:'synthetic-challenge'}));const user=h.session.store({user:{id:9,email:'fixture@example.invalid'},roles:['Admin'],token:valid('new'),refreshToken:'issued-refresh'});assert.deepEqual(user.roles,['Admin']);assert.equal(h.read().refreshToken,'issued-refresh');
});
test('parallel renewal requests share one rotation and atomically replace both credentials',async()=>{
 const wait=deferred();let calls=0;const h=harness(async(url,body)=>{calls++;assert.equal(url,'/auth/refresh-token');assert.deepEqual(body,{refreshToken:'synthetic-refresh'});return wait.promise;});const first=h.session.refresh(),second=h.session.refresh();assert.equal(first,second);wait.resolve({token:valid('rotated'),refreshToken:'rotated-refresh'});await Promise.all([first,second]);assert.equal(calls,1);assert.equal(h.read().refreshToken,'rotated-refresh');assert.equal(h.read().id,7);
});
test('failed renewal retains the previous credential pair',async()=>{const h=harness(async()=>{throw Error('Synthetic outage');});const before=h.read();await assert.rejects(h.session.refresh());assert.equal(h.read(),before);assert.equal(h.clears(),0);});
test('a late rotation response cannot overwrite a newer login or resurrect logout',async()=>{
 for(const replacement of [null,{id:8,token:valid('new-login'),refreshToken:'new-login-refresh'}]){const wait=deferred(),h=harness(()=>wait.promise),rotating=h.session.refresh();h.replace(replacement);wait.resolve({token:valid('late'),refreshToken:'late-refresh'});await assert.rejects(rotating,/Session changed/);assert.equal(h.read(),replacement);}
});
test('logout waits for server revocation; network failure retains local authentication',async()=>{
 const wait=deferred();const h=harness((url,body,bearer)=>{assert.equal(url,'/auth/logout');assert.deepEqual(body,{});assert.equal(bearer,h.read().token);return wait.promise;});const signingOut=h.session.logout();assert.ok(h.read());wait.resolve({message:'revoked'});await signingOut;assert.equal(h.read(),null);
 const failed=harness(async()=>{throw Error('offline');});await assert.rejects(failed.session.logout());assert.ok(failed.read());assert.equal(failed.clears(),0);
});
test('expired access rotates before logout; revoked refresh permits local cleanup',async()=>{
 const paths=[];const h=harness(async(url)=>{paths.push(url);return url.endsWith('refresh-token')?{token:valid('renewed'),refreshToken:'renewed-refresh'}:{};});h.replace({...h.read(),token:token(1)});await h.session.logout();assert.deepEqual(paths,['/auth/refresh-token','/auth/logout']);assert.equal(h.read(),null);
 const revoked=harness(async()=>{throw{response:{status:401,data:{message:'Invalid refresh token'}}};});revoked.replace({...revoked.read(),token:token(1)});await revoked.session.logout();assert.equal(revoked.read(),null);
});
test('late logout does not erase a newer sign-in',async()=>{const wait=deferred(),h=harness(()=>wait.promise),out=h.session.logout();const newer={id:8,token:valid('newer'),refreshToken:'newer-refresh'};h.replace(newer);wait.resolve({});await out;assert.equal(h.read(),newer);});
test('interceptor rotates expired reads once, preserves request context, and cleans up on unmount',async()=>{
 let rotations=0,clears=0,calls=0;const current={token:'synthetic-renewed'};const dispose=setupAxiosInterceptor(()=>clears++,async()=>{rotations++;return current;},()=>({token:'synthetic-old'}));
 try{const result=await axios.get('/api/profile',{headers:{Authorization:'Bearer synthetic-old'},adapter:async config=>{calls++;if(calls===1)throw{config,response:{status:401,data:{code:'TOKEN_EXPIRED'}}};assert.equal(config.headers.Authorization,'Bearer synthetic-renewed');return{status:200,data:{id:7},config};}});assert.equal(result.data.id,7);assert.equal(rotations,1);assert.equal(calls,2);assert.equal(clears,0);}finally{dispose();}
});
test('uploads/payment writes are never retried; transient refresh errors do not erase a session',async()=>{
 let calls=0,rotations=0,clears=0;const dispose=setupAxiosInterceptor(()=>clears++,async()=>{rotations++;throw{response:{status:503}};},()=>({token:'synthetic-old'}));
 try{for(const method of ['post','put','patch','delete'])await assert.rejects(axios({url:'/api/payment-or-upload',method,headers:{Authorization:'Bearer synthetic-old'},adapter:async config=>{calls++;throw{config,response:{status:401,data:{code:'TOKEN_EXPIRED'}}};}}));assert.equal(calls,4);assert.equal(rotations,0);assert.equal(clears,0);
 await assert.rejects(axios.get('/api/profile',{headers:{Authorization:'Bearer synthetic-old'},adapter:async config=>{throw{config,response:{status:401,data:{code:'TOKEN_EXPIRED'}}};}}));assert.equal(rotations,1);assert.equal(clears,0);}finally{dispose();}
});
test('a read sent before rotation retries the current token without another refresh',async()=>{
 let calls=0;const dispose=setupAxiosInterceptor(()=>assert.fail('must not clear'),()=>assert.fail('must not rotate twice'),()=>({token:'already-rotated'}));
 try{await axios.get('/api/profile',{headers:{Authorization:'Bearer old'},adapter:async config=>{calls++;if(calls===1)throw{config,response:{status:401,data:{code:'SESSION_REVOKED'}}};assert.equal(config.headers.Authorization,'Bearer already-rotated');return{status:200,data:{},config};}});assert.equal(calls,2);}finally{dispose();}
});
test('login challenge, reset policy, read-only email and logout are wired into actual components',()=>{
 const read=file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8');assert.match(read('context/temp.jsx'),/data\.requires2FA.*requires2FA/s);assert.match(read('pages/login/LoginPage.jsx'),/completeTwoFactor\(challenge, verificationCode\)/);assert.match(read('pages/login/LoginPage.jsx'),/setPassword\(''\)/);assert.match(read('pages/login/ResetPassword.jsx'),/newPassword\.length < 8/);assert.match(read('pages/dashboard/EditProfile.jsx'),/name="email"\s+readOnly/);assert.match(read('pages/operations/People.jsx'),/type="email"[^>]*readOnly/);assert.match(read('components/navbar/TopNavBar.jsx'),/await logout\(\)/);assert.ok(secondsRemaining(token(1))<0);assert.equal(secondsRemaining('invalid'),0);
});
