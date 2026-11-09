import {useEffect,useState} from 'react';
import axios from 'axios';
import {useAuth} from '../context/temp';
import {readReview,readinessMessage} from '../utils/reviewReadiness.mjs';
export default function ReviewPlayer({videoId,title}){
 const {user}=useAuth(),[result,setResult]=useState({state:'CONNECTING'}),[revision,setRevision]=useState(0),[pollingStopped,setPollingStopped]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();let active=true,timer,checks=0;
  async function check(){try{
   const next=await readReview(signal=>axios.get(`${import.meta.env.VITE_API_URL||'http://localhost:3001/api'}/videos/${videoId}/readiness`,{signal,timeout:10000,headers:{Authorization:`Bearer ${user.token}`}}).then(r=>r.data),controller.signal);
   if(!active)return;setResult(next);checks++;
   // Bounded metadata checks only; never retry an upload or grant playback early.
   if(next.state==='PROCESSING'&&checks<20)timer=setTimeout(()=>{if(document.visibilityState!=='hidden')check();else setPollingStopped(true);},30000);
   else if(next.state==='PROCESSING')setPollingStopped(true);
  }catch{if(active)setResult({state:'UNKNOWN'});}}
  setPollingStopped(false);setResult({state:'CONNECTING'});check();
  return()=>{active=false;controller.abort();clearTimeout(timer);};
 },[videoId,user.token,revision]);
 return <div><p role="status">{readinessMessage(result.state)}</p>{result.state==='PROCESSING'&&<p className="small text-muted">{pollingStopped?'Automatic checks are paused. Check again when you return, or contact support if preparation keeps taking too long.':'We’ll check again automatically while this preview stays open.'}</p>}{result.state==='READY'&&result.player?<iframe className="ops-video-player scholar-video-preview" src={result.player} title={`Review ${title}`} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:result.state!=='CONNECTING'&&<button className="btn btn-outline-primary btn-sm" type="button" onClick={()=>setRevision(n=>n+1)}>Check readiness again</button>}</div>;
}
