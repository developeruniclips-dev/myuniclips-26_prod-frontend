// Display the server's decision. Never infer a provider from browser location.
export function validPayment(p){return !!p&&['EUR','NGN'].includes(p.currency)&&Number.isSafeInteger(p.amountMinor)&&p.amountMinor>0&&((p.provider==='stripe'&&p.currency==='EUR')||(p.provider==='paystack'&&p.currency==='NGN'));}
export function paymentPrice(p,locale){return validPayment(p)?new Intl.NumberFormat(locale,{style:'currency',currency:p.currency}).format(p.amountMinor/100):'Price unavailable';}
export function checkoutAllowed(p){return validPayment(p)&&(p.provider==='stripe'||p.provider==='paystack'&&p.checkoutMode==='test')&&p.checkoutEnabled===true&&typeof p.contextVersion==='string';}
export function paymentLabel(p){return validPayment(p)?`${paymentPrice(p)} · ${p.provider==='paystack'?'Paystack':'Stripe'}${checkoutAllowed(p)?'':' · Checkout unavailable'}`:'Checkout unavailable';}
export function checkoutBody(subjectId,scholarId,p){if(!checkoutAllowed(p))throw Error('Checkout unavailable');return {subjectId:Number(subjectId),scholarId:Number(scholarId),contextVersion:p.contextVersion};}
export function stripeRedirect(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='checkout.stripe.com'&&!u.username&&!u.password&&!u.port?u.href:null;}catch{return null;}}
export function hostedRedirect(url,provider){if(provider==='stripe')return stripeRedirect(url);try{const u=new URL(url);return provider==='paystack'&&u.protocol==='https:'&&u.hostname==='checkout.paystack.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/[A-Za-z0-9-]{1,100}$/.test(u.pathname)?u.href:null;}catch{return null;}}
export function paystackStatus(data,subjectId,scholarId,orderId){
 const same=data?.provider==='paystack'&&(!orderId||data.orderId===orderId)&&Number(data.subjectId)===Number(subjectId)&&Number(data.scholarId)===Number(scholarId)&&data.currency==='NGN'&&data.amountMinor===150000;
 if(same&&data.state==='fulfilled'&&data.success===true)return {type:'success',confirmed:true,text:'Payment verified. Your course access is ready.'};
 if(same&&data.state==='review')return {type:'warning',confirmed:false,text:'Payment needs review. Do not pay again; contact UniClips support.'};
 if(same&&data.state==='failed')return {type:'warning',confirmed:false,text:'Payment was not completed. Do not start another payment until this order is resolved.'};
 return {type:'info',confirmed:false,text:'Payment is pending verification. Check status again before paying.'};
}
export function checkoutRequestKey(storage,buyer,subject,scholar){const key=`paystack-request:${buyer}:${subject}:${scholar}`;let value=storage.getItem(key);if(!value){value=globalThis.crypto.randomUUID();storage.setItem(key,value);}return value;}
export function financialMoney(value,currency){if(value==null||!['EUR','NGN'].includes(currency)||!/^\-?\d+(\.\d{1,2})?$/.test(String(value))||!Number.isFinite(Number(value)))return 'Unavailable';return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(Number(value));}
// Counts may be combined; amounts remain in their own currency buckets.
export function recordedSales(data){
 const buckets=data?.summariesByCurrency&&Object.keys(data.summariesByCurrency).length?Object.values(data.summariesByCurrency):data?.summary?[data.summary]:[];
 if(!buckets.length)return null;
 const result={totalSales:0,monthlySales:0};
 for(const bucket of buckets)for(const key of Object.keys(result)){
  if(!Number.isSafeInteger(bucket?.[key])||bucket[key]<0)return null;
  result[key]+=bucket[key];if(!Number.isSafeInteger(result[key]))return null;
 }
 return result;
}
