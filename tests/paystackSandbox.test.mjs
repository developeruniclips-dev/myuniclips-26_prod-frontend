import test from 'node:test';
import assert from 'node:assert/strict';
import {backendOrigin,securityHeaders} from '../scripts/build-security-headers.mjs';
test('production header behavior stays default; sandbox selects one exact validated API origin',()=>{
 assert.equal(backendOrigin({}),'https://nyuniclips-26-prod-backend.onrender.com');
 const env={UNICLIPS_SANDBOX:'paystack-test-v1',SANDBOX_BACKEND_ORIGIN:'https://synthetic-sandbox.onrender.com',VITE_API_URL:'https://synthetic-sandbox.onrender.com/api'};
 const headers=securityHeaders('',env);assert.match(headers,/connect-src 'self' https:\/\/synthetic-sandbox.onrender.com /);assert.doesNotMatch(headers,/nyuniclips-26-prod-backend/);assert.doesNotMatch(headers,/script-src[^;]*paystack/);
});
test('sandbox builds refuse production API, guessed origin, mismatched Vite base and wildcard',()=>{
 const base={UNICLIPS_SANDBOX:'paystack-test-v1',SANDBOX_BACKEND_ORIGIN:'https://synthetic-sandbox.onrender.com',VITE_API_URL:'https://synthetic-sandbox.onrender.com/api'};
 for(const patch of [{UNICLIPS_SANDBOX:'enabled'},{SANDBOX_BACKEND_ORIGIN:'https://nyuniclips-26-prod-backend.onrender.com'},{SANDBOX_BACKEND_ORIGIN:'http://synthetic-sandbox.onrender.com'},{VITE_API_URL:'https://nyuniclips-26-prod-backend.onrender.com/api'},{SANDBOX_BACKEND_ORIGIN:'https://*.onrender.com'},{SANDBOX_BACKEND_ORIGIN:'https://synthetic-sandbox.onrender.com/path'}])assert.throws(()=>backendOrigin({...base,...patch}));
});
