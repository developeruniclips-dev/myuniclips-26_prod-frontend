export const collections = {
 '/videos/all-videos':'videos', '/videos/admin/all':'videos', '/videos/scholar/my-videos':'videos',
 '/library/my-library':'library', '/library/learning-progress':'progress'
};
const failure=(code,message)=>Object.assign(new Error(message),{code});
export async function pagedGet(client,url,options={}){
 const target=new URL(url,'https://local.invalid'),entry=Object.entries(collections).find(([suffix])=>target.pathname.endsWith(suffix));
 if(!entry)return client.get(url,options);
 const [suffix,key]=entry,limit=suffix==='/library/my-library'?50:100;
 const controller=new AbortController(),cancel=()=>controller.abort(options.signal?.reason);
 if(options.signal?.aborted)throw failure('ERR_CANCELED','Request cancelled');
 options.signal?.addEventListener('abort',cancel,{once:true});
 const deadline=Date.now()+60000,timer=setTimeout(()=>controller.abort(),60000);
 // This helper always loads a whole collection. Remove caller/URL page controls, retaining filters.
 for(const name of ['limit','before','cursor'])target.searchParams.delete(name);
 const requestUrl=/^https?:\/\//.test(url)?target.href:target.pathname+target.search;
 const params={...options.params};for(const name of ['limit','before','cursor'])delete params[name];
 let before,cursor,first;const rows=[],seen=new Set(),identities=new Set();
 try{
  for(let page=0;page<100;page++){
   if(controller.signal.aborted)throw failure(options.signal?.aborted?'ERR_CANCELED':'COLLECTION_TIMEOUT','Collection could not be fully loaded. Refresh to try again.');
   const remaining=deadline-Date.now();if(remaining<=0)throw failure('COLLECTION_TIMEOUT','Collection could not be fully loaded. Refresh to try again.');
   const response=await client.get(requestUrl,{...options,signal:controller.signal,timeout:Math.min(options.timeout??15000,remaining),params:{...params,limit,...(cursor?{cursor}:before?{before}: {})}});
   if(controller.signal.aborted||Date.now()>deadline)throw failure(options.signal?.aborted?'ERR_CANCELED':'COLLECTION_TIMEOUT','Collection could not be fully loaded. Refresh to try again.');
   first??=response;const items=response.data?.[key];
   if(!Array.isArray(items)||items.length>10000||(response.data.pagination&&items.length>limit))throw failure('COLLECTION_INVALID','Collection could not be fully loaded. Refresh to try again.');
   for(const item of items){const id=key==='progress'?item.video_id:item.id;if(id!==undefined){const identity=String(id);if(identities.has(identity))throw failure('COLLECTION_CHANGED','Collection changed while loading. Refresh to load it again.');identities.add(identity);}}
   rows.push(...items);if(rows.length>10000)throw failure('COLLECTION_LIMIT','Collection is too large to display. Please contact support.');
   const paging=response.data.pagination;
   if(!paging||paging.hasMore===false)return{...first,data:{...first.data,[key]:rows,...(paging?{pagination:{...paging,hasMore:false,nextBefore:null,nextCursor:null}}:{})}};
   if(paging.hasMore!==true)throw failure('COLLECTION_INVALID','Invalid collection response');
   if(paging.nextCursor!==undefined&&paging.nextCursor!==null){
    if(typeof paging.nextCursor!=='string'||paging.nextCursor.length>240||!/^[A-Za-z0-9_-]+$/.test(paging.nextCursor)||seen.has('c:'+paging.nextCursor))throw failure('COLLECTION_INVALID','Invalid collection cursor');
    cursor=paging.nextCursor;before=undefined;seen.add('c:'+cursor);
   }else{
    if(!Number.isSafeInteger(paging.nextBefore)||paging.nextBefore<=0||(before&&paging.nextBefore>=before)||seen.has('n:'+paging.nextBefore))throw failure('COLLECTION_INVALID','Invalid collection cursor');
    before=paging.nextBefore;cursor=undefined;seen.add('n:'+before);
   }
  }
  throw failure('COLLECTION_LIMIT','Collection is too large to display. Please contact support.');
 }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',cancel);}
}
