import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/temp';
import { requestTaskCard } from '../utils/taskCardDownload.mjs';

// Fetch the authorized API route with a bearer header; never put tokens in a URL.
export default function PrivateTaskCard({ userId }) {
 const { user }=useAuth(), [document,setDocument]=useState(null), [error,setError]=useState(''), [busy,setBusy]=useState(false);
 const active=useRef(true), currentURL=useRef(null), controller=useRef(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort();if(currentURL.current)URL.revokeObjectURL(currentURL.current);};},[userId]);
 async function load(){
  setBusy(true);setError('');controller.current=new AbortController();
  try{
   const {blob,extension}=await requestTaskCard({api:import.meta.env.VITE_API_URL||'http://localhost:3001/api',userId,token:user?.token,signal:controller.current.signal});
   if(!active.current)return;
   if(currentURL.current)URL.revokeObjectURL(currentURL.current);
   currentURL.current=URL.createObjectURL(blob);
   setDocument({url:currentURL.current,extension});
  }catch{if(active.current)setError('Unable to retrieve this document. Refresh or contact support.');}
  finally{if(active.current)setBusy(false);}
 }
 return <div>{document?<a href={document.url} download={`task-card.${document.extension}`}>Download submitted task card</a>:<button type="button" onClick={load} disabled={busy}>{busy?'Retrieving document…':'Retrieve submitted task card'}</button>}{error&&<p role="alert">{error}</p>}</div>;
}
