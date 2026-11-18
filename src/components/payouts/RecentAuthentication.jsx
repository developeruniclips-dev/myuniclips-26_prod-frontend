import {useState} from 'react';
import {bankError} from './bankApi';
export default function RecentAuthentication({api,purpose,target='',onReady}){
  const [password,setPassword]=useState(''),[factor,setFactor]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e){
    e.preventDefault();setBusy(true);setError('');
    try{const result=await api('/reauthenticate',{password,purpose,target,...(factor.includes('-')?{backupCode:factor}:{token:factor||undefined})});onReady(result.proof);}
    catch(err){setError(bankError(err));}finally{setPassword('');setFactor('');setBusy(false);}
  }
  return <form onSubmit={submit} className="bank-auth">
    <h4>Confirm it is you</h4>
    <p>Enter your current password and, if enabled, an authenticator or recovery code. Sensitive permissions last five minutes.</p>
    <label>Current password<input autoComplete="current-password" type="password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label>Authenticator or recovery code (if enabled)<input autoComplete="off" maxLength={39} value={factor} onChange={e=>setFactor(e.target.value.trim())}/></label>
    <button disabled={busy} type="submit">{busy?'Checking…':'Confirm identity'}</button>
    {error&&<p role="alert">{error}</p>}
  </form>;
}
