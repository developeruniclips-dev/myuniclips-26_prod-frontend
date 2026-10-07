// One in-flight rotation per tab; stale responses cannot overwrite a newer login/logout.
export function createAuthSession({ request, read, write, clear }) {
 let inFlight=null;
 const store=data=>{
  if(!data?.user||typeof data.token!=='string'||typeof data.refreshToken!=='string')throw Error('Incomplete sign-in response');
  const user={...data.user,roles:data.roles||[],token:data.token,refreshToken:data.refreshToken};write(user);return user;
 };
 const refresh=()=>{
  if(inFlight)return inFlight;
  const original=read();
  if(!original?.refreshToken)return Promise.reject(Error('Sign in again'));
  inFlight=(async()=>{
   const data=await request('/auth/refresh-token',{refreshToken:original.refreshToken});
   if(read()?.token!==original.token||read()?.refreshToken!==original.refreshToken)throw Error('Session changed');
   if(typeof data.token!=='string'||typeof data.refreshToken!=='string')throw Error('Incomplete refresh response');
   const current={...original,token:data.token,refreshToken:data.refreshToken};write(current);return current;
  })().finally(()=>{inFlight=null;});return inFlight;
 };
 const logout=async()=>{
  let original=read();if(!original){clear();return true;}
  try {
   if(secondsRemaining(original.token)<=0){await refresh();original=read();}
   await request('/auth/logout',{},original.token);
  } catch(error) {
   // A rejected refresh or a revoked live binding confirms that this local
   // credential cannot continue. Network/5xx failures still retain the session.
   if(error.response?.status!==401||error.response?.data?.code==='TOKEN_EXPIRED')throw error;
  }
  if(read()?.token===original.token)clear();return true;
 };
 return{store,refresh,logout};
}
export function secondsRemaining(token,now=Date.now()) {
 try{const value=JSON.parse(atob(token.split('.')[1].replaceAll('-','+').replaceAll('_','/')));return value.exp-now/1000;}catch{return 0;}
}
