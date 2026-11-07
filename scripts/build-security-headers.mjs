import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function backendOrigin(env={}){
 const production='https://nyuniclips-26-prod-backend.onrender.com';
 if(!env.UNICLIPS_SANDBOX)return production;
 if(env.UNICLIPS_SANDBOX!=='paystack-test-v1')throw Error('Unknown sandbox build mode');
 const u=new URL(env.SANDBOX_BACKEND_ORIGIN);
 if(u.protocol!=='https:'||u.origin!==env.SANDBOX_BACKEND_ORIGIN||u.username||u.password||
    !/^[a-z0-9-]+\.onrender\.com$/.test(u.hostname)||u.origin===production||env.VITE_API_URL!==u.origin+'/api')throw Error('Isolated sandbox API origin required');
 return u.origin;
}
export function securityHeaders(html,env=process.env){
 const api=backendOrigin(env);
 const inline=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m=>"'sha256-"+crypto.createHash('sha256').update(m[1]).digest('base64')+"'");
 const policy=[
  "default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'self'",
  "script-src 'self' "+inline.join(' ')+" https://js.stripe.com https://*.js.stripe.com https://player.vimeo.com",
  "script-src-attr 'none'","style-src-elem 'self' https://fonts.googleapis.com","style-src-attr 'unsafe-inline'",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: "+api+" https://i.vimeocdn.com https://*.stripe.com",
  "connect-src 'self' "+api+" https://api.stripe.com https://checkout.stripe.com",
  "frame-src https://player.vimeo.com https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "media-src 'self' blob:","worker-src 'self' blob:","form-action 'self' https://checkout.stripe.com","manifest-src 'self'"
 ].join('; ');
 return "/*\n  Content-Security-Policy: base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://checkout.stripe.com\n  Content-Security-Policy-Report-Only: "+policy+"\n";
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 fs.writeFileSync('dist/_headers',securityHeaders(fs.readFileSync('dist/index.html','utf8')));
 console.log('Built browser security headers with exact structured-data hashes; full policy is report-only.');
}
