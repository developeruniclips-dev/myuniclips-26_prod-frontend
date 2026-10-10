export const workflowLabel=state=>({DRAFT:'Draft',SUBMITTED_FOR_REVIEW:'Submitted for Review',CHANGES_REQUESTED:'Changes Requested',PUBLISHED:'Published'}[state]||'Unavailable');
export const canEditCourse=data=>data?.editable===true&&['DRAFT','CHANGES_REQUESTED'].includes(data?.workflow?.state);
export function readinessMessage(state){return ({CONNECTING:'Connecting to video review…',PROCESSING:'Video is processing. Your upload was successful and is being prepared for review.',FAILED:'Video preparation failed. Contact support before uploading again.',UNKNOWN:'We could not confirm video readiness. Please try again.',READY:'Ready for review'}[state]||'Video readiness unavailable');}
export function safeReviewPlayer(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='player.vimeo.com'&&!u.port&&!u.username&&!u.password&&!u.hash&&/^\/video\/\d+$/.test(u.pathname)&&[...u.searchParams.keys()].every(k=>k==='h')&&(!u.searchParams.has('h')||/^[a-zA-Z0-9]{6,64}$/.test(u.searchParams.get('h')))?u.href:null;}catch{return null;}}
export async function readReview(get,signal,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))){
 for(let attempt=0;attempt<2;attempt++){
  if(signal?.aborted)throw Object.assign(new Error('Canceled'),{name:'AbortError'});
  try{const result=await get(signal);const state=['READY','PROCESSING','FAILED','UNKNOWN'].includes(result?.state)?result.state:'UNKNOWN';const player=state==='READY'?safeReviewPlayer(result.player_url):null;return {state:state==='READY'&&!player?'UNKNOWN':state,player};}
  catch(error){if(signal?.aborted||error.name==='AbortError'||error.code==='ERR_CANCELED')throw error;const status=error.response?.status;if(attempt||status&&status<500)throw error;await pause(1000);}
 }
}
