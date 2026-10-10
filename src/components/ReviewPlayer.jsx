import {useEffect,useState} from 'react';
import axios from 'axios';
import {useAuth} from '../context/temp';
import {readReview,readinessMessage} from '../utils/reviewReadiness.mjs';
export default function ReviewPlayer({videoId,title}){
 const {user}=useAuth(),[result,setResult]=useState({state:'CONNECTING'}),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();let active=true,timer,checks=0;
  async function check(){try{
   const next=await readReview(signal=>axios.get(`${import.meta.env.VITE_API_URL||'http://localhost:3001/api'}/videos/${videoId}/readiness`,{signal,timeout:10000,headers:{Authorization:`Bearer ${user.token}`}}).then(r=>r.data),controller.signal);
   if(!active)return;setResult(next);checks++;
   // Only evidence of processing triggers polling: at most four checks, 30s apart.
   if(next.state==='PROCESSING'&&checks<4)timer=setTimeout(check,30000);
  }catch{if(active)setResult({state:'UNKNOWN'});}}
  setResult({state:'CONNECTING'});check();
  return()=>{active=false;controller.abort();clearTimeout(timer);};
 },[videoId,user.token,revision]);
 return <div><p role="status">{readinessMessage(result.state)}</p>{result.state==='READY'&&result.player?<iframe className="ops-video-player scholar-video-preview" src={result.player} title={`Review ${title}`} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:result.state!=='CONNECTING'&&<button type="button" onClick={()=>setRevision(n=>n+1)}>Check readiness again</button>}</div>;
}
