import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentPrice,paymentLabel,checkoutAllowed,checkoutBody,stripeRedirect,financialMoney,recordedSales} from '../src/utils/coursePayments.mjs';
import {publishedCourses} from '../src/utils/publicCourses.mjs';
import {buildCatalog,buildPurchased,recommendCourses} from '../src/pages/dashboard/learnerData.mjs';
const ng={provider:'paystack',currency:'NGN',amountMinor:150000,checkoutEnabled:false,contextVersion:'ng'};
const fi={provider:'stripe',currency:'EUR',amountMinor:700,checkoutEnabled:true,contextVersion:'fi'};

test('Scholar headline counts include NG sales while amounts stay currency-separated',()=>{
 const eur={totalSales:100,monthlySales:5,scholarEarnings:'420.00'},ngn={totalSales:1,monthlySales:1,scholarEarnings:'750.00'};
 const data={summary:eur,summariesByCurrency:{EUR:eur,NGN:ngn}};
 assert.deepEqual(recordedSales(data),{totalSales:101,monthlySales:6});assert.equal(data.summariesByCurrency.NGN.scholarEarnings,'750.00');
 assert.deepEqual(recordedSales({summary:eur}),{totalSales:100,monthlySales:5});
 assert.equal(recordedSales(null),null);assert.equal(recordedSales({summariesByCurrency:{NGN:{totalSales:1}}}),null);
 assert.equal(recordedSales({summary:{totalSales:Number.MAX_SAFE_INTEGER+1,monthlySales:0}}),null);
});
test('same authoritative NGN/EUR values for every browser locale; Paystack stays unavailable',()=>{
 for(const locale of ['en-NG','fi-FI','en-GB','en-US','de-DE']){
  assert.match(paymentPrice(ng,locale),/1.?500/);assert.match(paymentPrice(fi,locale),/7/);
  assert.equal(checkoutAllowed(ng),false);assert.equal(checkoutAllowed(fi),true);
 }
 assert.match(paymentLabel(ng),/Paystack.*unavailable/);assert.throws(()=>checkoutBody(1,2,ng));assert.deepEqual(checkoutBody(1,2,fi),{subjectId:1,scholarId:2,contextVersion:'fi'});
});
test('missing/mismatched money fails closed; no guessed EUR price or redirect fallback',()=>{
 for(const p of [null,{}, {...ng,currency:'EUR'},{...fi,amountMinor:null},{...fi,amountMinor:0},{...fi,amountMinor:'700'}]){assert.equal(checkoutAllowed(p),false);assert.equal(paymentPrice(p),'Price unavailable');}
 for(const url of ['http://checkout.stripe.com/a','https://checkout.stripe.com.evil.invalid','https://paystack.com/a','javascript:alert(1)','https://user@checkout.stripe.com/a'])assert.equal(stripeRedirect(url),null);
 assert.equal(stripeRedirect('https://checkout.stripe.com/c/pay/fixture'),'https://checkout.stripe.com/c/pay/fixture');
 for(const [v,c]of [[null,'EUR'],['1.00',null],['NaN','NGN'],['1','USD']])assert.equal(financialMoney(v,c),'Unavailable');
});
test('catalogue and recommendations carry server metadata without buyer-country eligibility filtering',()=>{
 const rows=[{id:1,subject_id:100,scholar_user_id:7,approved:1,subject_name:'NG',university_id:55,payment:ng,sequence_index:1},{id:2,subject_id:200,scholar_user_id:8,approved:1,subject_name:'FI',university_id:1,payment:fi,sequence_index:1}];
 const courses=publishedCourses(rows),catalog=buildCatalog(rows);assert.deepEqual(courses.map(c=>c.payment),[ng,fi]);assert.deepEqual(catalog.map(c=>c.payment),[ng,fi]);
 for(const country of ['FI','NG','GB','US','other'])assert.equal(recommendCourses(catalog,[],{country_code:country,university_id:999}).length,2);
 const owned=buildPurchased(catalog,[{subject_id:100,scholar_id:7,amount:'1500.00',currency:'NGN',provider:'paystack',payment:ng}],[],null);assert.equal(owned[0].paidCurrency,'NGN');assert.equal(owned[0].provider,'paystack');
});
