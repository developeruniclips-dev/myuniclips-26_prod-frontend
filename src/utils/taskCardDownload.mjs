export async function requestTaskCard({ api, userId, token, signal, fetcher=fetch }) {
 if(!Number.isSafeInteger(Number(userId))||Number(userId)<1||typeof token!=='string'||!token)throw new Error('Document unavailable');
 const response=await fetcher(`${api}/scholar-profile/${Number(userId)}/task-card`,{headers:{Authorization:`Bearer ${token}`},signal,cache:'no-store'});
 if(!response.ok)throw new Error('Document unavailable');
 const type=response.headers.get('Content-Type')?.split(';')[0];
 if(!['image/jpeg','image/png','application/pdf'].includes(type)||Number(response.headers.get('Content-Length'))>5*1024*1024)throw new Error('Document unavailable');
 const blob=await response.blob();
 if(blob.size>5*1024*1024)throw new Error('Document unavailable');
 return {blob,extension:type==='application/pdf'?'pdf':type==='image/png'?'png':'jpg'};
}
