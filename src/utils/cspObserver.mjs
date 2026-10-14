// No destinations, sample text, private data or external reporting endpoint.
export function observeCsp(document){
 const counts=new Map();
 const listen=event=>{
  const directive=String(event.effectiveDirective||'unknown').replace(/[^a-z-]/g,'').slice(0,40)||'unknown';
  const disposition=event.disposition==='enforce'?'enforce':'report';
  const key=directive+':'+disposition;
  if(counts.has(key)||counts.size<32)counts.set(key,Math.min(100000,(counts.get(key)||0)+1));
 };
 document.addEventListener('securitypolicyviolation',listen);
 return{summary:()=>Object.fromEntries(counts),stop:()=>document.removeEventListener('securitypolicyviolation',listen)};
}
