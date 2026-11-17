import test,{afterEach} from 'node:test';
import a from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import path from 'node:path';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/',pretendToBeVisual:true});
for(const k of ['window','document','HTMLElement','Element','Node','MutationObserver','getComputedStyle','localStorage'])globalThis[k]=dom.window[k];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react'),{render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {MemoryRouter}=await import('react-router-dom'),require=createRequire(import.meta.url),axios=require('axios');
const file=path.resolve('.test-artifacts/scholar-bank-ui.cjs');
await build({entryPoints:['src/components/payouts/NigeriaPayoutDetails.jsx'],outfile:file,bundle:true,platform:'node',format:'cjs',packages:'external',jsx:'automatic',loader:{'.css':'empty'},define:{'import.meta.env.VITE_API_URL':JSON.stringify('http://localhost:3001/api')}});
const Panel=require(file).default,original=axios.request;
let calls=[],destination=null,failure=null,disabled=false;
afterEach(()=>{cleanup();axios.request=original;localStorage.clear();calls=[];destination=null;failure=null;disabled=false;});
function fixture(){
 axios.request=async config=>{
  a.equal(new URL(config.url).origin,'http://localhost:3001');
  a.equal(config.withCredentials,false);a.equal(config.headers.Authorization,'Bearer synthetic-ui');
  const route=new URL(config.url).pathname.replace('/api/scholar-payout-details','');calls.push({route,body:config.data});
  if(route==='/status')return {data:disabled?{enabled:false}:{enabled:true,destination,payoutsHeld:true}};
  if(route==='/banks')return {data:[{code:'999',name:'Synthetic Bank'}]};
  if(route==='/reauthenticate')return {data:{proof:'synthetic-proof'}};
  if(route==='/resolve'){
   if(failure)throw {response:{data:failure}};
   return {data:{challengeId:'synthetic-challenge',bankName:'Synthetic Bank',accountName:'SYNTHETIC HOLDER',accountLast4:'0001'}};
  }
  if(route==='/confirm'){a.equal(config.data.confirmation,'USE THIS ACCOUNT FOR UNICLIPS PAYOUTS');destination={bankName:'Synthetic Bank',accountNameMasked:'S******** H*****',accountLast4:'0001'};return {data:{confirmed:true}};}
  throw Error('Unexpected mock path '+route);
 };
 render(React.createElement(MemoryRouter,null,React.createElement(Panel,{token:'synthetic-ui'})));
}
async function authenticate(){
 fireEvent.click(await screen.findByRole('button',{name:'Add payout bank account'}));
 fireEvent.change(await screen.findByLabelText('Current password'),{target:{value:'synthetic-password'}});
 fireEvent.click(screen.getByRole('button',{name:'Confirm identity'}));
 await screen.findByLabelText('Nigerian bank');
}
async function resolve(){
 await authenticate();fireEvent.change(screen.getByLabelText('Nigerian bank'),{target:{value:'999'}});
 fireEvent.change(screen.getByLabelText('Account number'),{target:{value:'0000000001'}});
 fireEvent.click(screen.getByRole('button',{name:'Verify bank account'}));
}
test('first account requires explicit confirmation, masks number and never stores bank data in browser storage',async()=>{
 fixture();await resolve();await screen.findByText('SYNTHETIC HOLDER');
 a(!document.body.textContent.includes('0000000001'));a.equal(screen.getByRole('button',{name:'Confirm payout account'}).disabled,true);
 a.equal(calls.filter(c=>c.route==='/confirm').length,0);
 fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Confirm payout account'}));
 await screen.findByText(/Your payout account is registered/);
 a.equal(calls.filter(c=>c.route==='/confirm').length,1);a.equal(localStorage.length,0);
 a.equal(screen.queryByRole('button',{name:'Request Bank Account Change'}),null);
});
test('registered account has only support guidance and no replacement fields or change button',async()=>{
 destination={bankName:'Synthetic Bank',accountNameMasked:'S******** H*****',accountLast4:'0001'};fixture();
 await screen.findByText(/Your payout account is registered/);a(screen.getByRole('link',{name:'contact support'}).getAttribute('href')==='/support');
 a.equal(screen.queryByLabelText('Account number'),null);a.equal(screen.queryByRole('button',{name:'Add payout bank account'}),null);
});
test('disabled bank feature preserves the optional teaching and held earnings explanation',async()=>{
 disabled=true;fixture();await screen.findByText(/Bank details are not enabled yet/);
 a.equal(screen.queryByRole('button',{name:'Add payout bank account'}),null);a.equal(calls.length,1);
});
test('resolve failure is explained and cannot create a recipient',async()=>{
 failure={code:'BANK_RESOLUTION_FAILED',message:'The bank could not confirm this account'};fixture();await resolve();
 await screen.findByRole('alert');a.equal(calls.filter(c=>c.route==='/confirm').length,0);
});
test('expired proof returns to fresh authentication and clears the account input',async()=>{
 failure={code:'BANK_REAUTH_REQUIRED',message:'Confirm your password again'};fixture();await resolve();await screen.findByRole('alert');
 await screen.findByLabelText('Current password');a.equal(screen.queryByLabelText('Account number'),null);
});
test('closing setup clears transient resolved name and account data',async()=>{
 fixture();await resolve();await screen.findByText('SYNTHETIC HOLDER');fireEvent.click(screen.getByRole('button',{name:'Close'}));
 await waitFor(()=>a.equal(screen.queryByText('SYNTHETIC HOLDER'),null));a.equal(localStorage.length,0);
});
