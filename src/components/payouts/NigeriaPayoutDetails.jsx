import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {bankApi,bankError} from './bankApi';
import RecentAuthentication from './RecentAuthentication';
import './payouts.css';

export default function NigeriaPayoutDetails({token}){
 const api=useMemo(()=>bankApi(token),[token]);
 const [data,setData]=useState(null),[banks,setBanks]=useState([]),[open,setOpen]=useState(false);
 const [proof,setProof]=useState(''),[bank,setBank]=useState(''),[number,setNumber]=useState('');
 const [resolved,setResolved]=useState(null),[confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;api('/status').then(r=>{if(live)setData(r);}).catch(e=>{if(live)setError(bankError(e));});return()=>{live=false;};},[api]);
 async function refresh(){setData(await api('/status'));}
 function close(){setOpen(false);setProof('');setNumber('');setResolved(null);setConfirmed(false);}
 async function act(work){
  if(busy)return;setBusy(true);setError('');
  try{await work();}catch(e){
   setError(bankError(e));
   if(['BANK_REAUTH_REQUIRED','BANK_CHALLENGE_EXPIRED'].includes(e.response?.data?.code)){setProof('');setResolved(null);setNumber('');setConfirmed(false);}
   if(['BANK_RECIPIENT_REVIEW','BANK_ALREADY_REGISTERED'].includes(e.response?.data?.code)){close();try{await refresh();}catch{}}
  }finally{setBusy(false);}
 }
 if(data?.enabled===false)return <section className="bank-panel"><h3>Bank Account / Payout Details</h3><p>Bank details are not enabled yet. You can continue teaching and recording held earnings.</p></section>;
 return <section className="bank-panel" aria-labelledby="ng-bank-title">
  <h3 id="ng-bank-title">Bank Account / Payout Details</h3>
  <p>Optional until payout. You can register, receive Scholar approval, upload, publish, sell courses and accumulate held earnings without a bank account. Adding an account does not release earnings.</p>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!data?<p>Loading payout details…</p>:<>
   {data.destination?<><p><strong>{data.destination.bankName}</strong> · Account ending {data.destination.accountLast4} · {data.destination.accountNameMasked}</p><p>Your payout account is registered. If you need help with these details, <Link to="/support">contact support</Link>.</p></>:<p>No payout bank account registered.</p>}
   {data.recipientReview&&<p role="alert">An earlier recipient registration needs review. Please <Link to="/support">contact support</Link> rather than submitting again. Earnings remain held.</p>}
   {data.notificationPending&&<p role="status">Your confirmation email is pending delivery to your account email.</p>}
   {!data.destination&&!data.recipientReview&&!open&&<button disabled={busy} onClick={()=>act(async()=>{setBanks(await api('/banks'));setOpen(true);})}>Add payout bank account</button>}
   {open&&!data.destination&&!data.recipientReview&&<div>
    {!proof?<RecentAuthentication api={api} purpose="setup" onReady={setProof}/>:!resolved?<form onSubmit={e=>{
     e.preventDefault();act(async()=>{setResolved(await api('/resolve',{bankCode:bank,accountNumber:number,proof}));setNumber('');});
    }}>
     <label>Nigerian bank<select required value={bank} onChange={e=>setBank(e.target.value)}><option value="">Select your bank</option>{banks.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label>
     <label>Account number<input required inputMode="numeric" autoComplete="off" pattern="[0-9]{10}" maxLength={10} value={number} onChange={e=>setNumber(e.target.value.replace(/\D/g,''))}/></label>
     <p>UniClips securely sends these details to Paystack to resolve your account. Full details are held briefly for this setup. Account-name resolution is not full KYC or proof of legal ownership.</p>
     <button disabled={busy}>Verify bank account</button>
    </form>:<div>
     <h4>Confirm your payout destination</h4><p>{resolved.bankName}<br/><strong>{resolved.accountName}</strong><br/>Account ending {resolved.accountLast4}</p>
     <label className="bank-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I confirm that I want to use this account to receive UniClips payouts.</label>
     <button disabled={busy||!confirmed} onClick={()=>act(async()=>{
      await api('/confirm',{proof,challengeId:resolved.challengeId,confirmation:'USE THIS ACCOUNT FOR UNICLIPS PAYOUTS'});
      close();setNotice('Payout account saved. A confirmation email is being sent to your account email. Earnings remain held.');await refresh();
     })}>Confirm payout account</button>
    </div>}
    <button disabled={busy} onClick={close}>Close</button>
   </div>}
   <button disabled={busy} onClick={()=>act(refresh)}>Refresh bank status</button>
  </>}
 </section>;
}
