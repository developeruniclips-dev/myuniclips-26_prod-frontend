import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutAllowed,hostedRedirect,paystackStatus,checkoutRequestKey} from '../src/utils/coursePayments.mjs';
test('Paystack requires explicit backend test-mode decision; host validation has no cross-provider fallback',()=>{
 const p={provider:'paystack',currency:'NGN',amountMinor:150000,contextVersion:'context',checkoutEnabled:true};
 assert.equal(checkoutAllowed(p),false);assert.equal(checkoutAllowed({...p,checkoutMode:'test'}),true);assert.equal(checkoutAllowed({...p,checkoutMode:'live'}),false);
 assert.equal(hostedRedirect('https://checkout.paystack.com/synthetic-token','paystack'),'https://checkout.paystack.com/synthetic-token');
 for(const url of ['https://checkout.paystack.com.evil.invalid/x','https://checkout.paystack.com/x?redirect=evil','https://user@checkout.paystack.com/x','https://checkout.stripe.com/x','javascript:alert(1)'])assert.equal(hostedRedirect(url,'paystack'),null);
 assert.equal(hostedRedirect('https://checkout.paystack.com/x','stripe'),null);assert.equal(hostedRedirect('https://checkout.stripe.com/x','stripe'),'https://checkout.stripe.com/x');
});
test('return URL values cannot grant access; owned backend state must match provider/order/course/price',()=>{
 const data={provider:'paystack',orderId:'owned',subjectId:10,scholarId:20,currency:'NGN',amountMinor:150000,state:'fulfilled',success:true};
 assert.equal(paystackStatus({success:true},10,20,'owned').confirmed,false);
 assert.equal(paystackStatus(data,10,20,'owned').confirmed,true);
 for(const patch of [{orderId:'other'},{subjectId:11},{currency:'EUR'},{amountMinor:150001},{provider:'stripe'},{state:'pending'},{state:'review'},{state:'failed'},{success:false}])assert.equal(paystackStatus({...data,...patch},10,20,'owned').confirmed,false);
 assert.match(paystackStatus({...data,state:'review'},10,20,'owned').text,/Do not pay again/);
});
test('checkout request identity persists per authenticated buyer/offering without another payment reference',()=>{
 const entries=new Map(),storage={getItem:k=>entries.get(k),setItem:(k,v)=>entries.set(k,v)};
 const one=checkoutRequestKey(storage,1,10,20);assert.match(one,/^[a-f0-9-]{36}$/);assert.equal(checkoutRequestKey(storage,1,10,20),one);assert.notEqual(checkoutRequestKey(storage,2,10,20),one);assert.notEqual(checkoutRequestKey(storage,1,11,20),one);
});
