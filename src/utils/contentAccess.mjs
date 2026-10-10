// Browser state is a UX hint. Playback metadata must come from the authorized API.
export function validPlayerUrl(value){
 try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='player.vimeo.com'&&!url.port&&!url.username&&!url.password&&!url.hash&&/^\/video\/\d+\/?$/.test(url.pathname)&&[...url.searchParams.keys()].every(k=>k==='h')&&(!url.searchParams.has('h')||/^[a-zA-Z0-9]{6,64}$/.test(url.searchParams.get('h')));}catch{return false;}
}
export async function authorizedLesson(client,api,token,videoId,subjectId,scholarId,signal){
 if(!token)throw Object.assign(new Error('Sign in to watch this lesson'),{status:401});
 const {data}=await client.get(`${api}/videos/watch/${videoId}`,{headers:{Authorization:`Bearer ${token}`},params:{subjectId,scholarId},signal});
 if(String(data.id)!==String(videoId)||(subjectId!==undefined&&String(data.subject_id)!==String(subjectId))||(scholarId!==undefined&&String(data.scholar_user_id)!==String(scholarId))||data.can_access!==true||!validPlayerUrl(data.player_url))throw new Error('Authorized playback is unavailable');
 return data;
}
