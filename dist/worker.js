(()=>{var e={470:e=>{e.exports={Router:({base:e="",routes:t=[]}={})=>({__proto__:new Proxy({},{get:(r,o,n)=>(r,...s)=>t.push([o.toUpperCase(),RegExp(`^${(e+r).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+)(\?)?(\.)?/g,"$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/,"\\.").replace(/\)\.\?\(([^\[]+)\[\^/g,"?)\\.?($1(?<=\\.)[^\\.")}/*$`),s])&&n}),routes:t,async handle(e,...r){let o,n,s=new URL(e.url);for(var[a,i,c]of(e.query=Object.fromEntries(s.searchParams),t))if((a===e.method||"ALL"===a)&&(n=s.pathname.match(i)))for(var u of(e.params=n.groups,c))if(void 0!==(o=await u(e.proxy||e,...r)))return o}})}},923:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.queryEndpoint=void 0;const o=r(279),n=r(147);t.queryEndpoint=async function(e){const t=caches.default;let r=await t.match(e);if(!r){const s=await e.json();if(void 0===s.server&&(s.server=o.DEFAULT_DOH_SERVER),void 0===s.question||void 0===s.type)return(0,n.JSONErrorResponse)("Need both'question', and 'type' set",400);const a=await(0,o.DNSQuery)(s);if(-1===a.Status)return(0,n.JSONErrorResponse)("Error getting DNS Response");r=(0,n.JSONResponse)(a,200,[["Cache-Control",a.Answer[0].TTL.toString()]]),await t.put(e,r.clone())}return r}},473:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.GetUsedDNSServer=t.DNSCryptInfo=void 0;const o=r(147),n="https://download.dnscrypt.info/dnscrypt-resolvers/json/public-resolvers.json";async function s(){const e=caches.default;let t=await e.match(n);if(!t){const r=await fetch(n,{headers:{accept:"application/json"}});if(200!==r.status)return console.error(r.statusText),(0,o.JSONErrorResponse)("Error getting upstream info");t=(0,o.JSONResponse)(await r.json()),await e.put(n,t.clone())}return t}t.DNSCryptInfo=async function(){return await s()},t.GetUsedDNSServer=async function(e){const t=caches.default;let r=await t.match(e);if(!r){let n=await KEYS.get("DoH_SERVERS",{type:"json"});if(null===n){const e=await(await s()).json();let t=[];e.forEach((e=>{e.nofilter&&"DoH"===e.proto&&t.push(e)})),n=t,await KEYS.put("DoH_SERVERS",JSON.stringify(t),{expirationTtl:86400})}r=(0,o.JSONResponse)(n,200,[["Cache-Control","86400"]]),await t.put(e,r.clone())}return r}},279:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DNSQuery=t.DEFAULT_DOH_SERVER=void 0,t.DEFAULT_DOH_SERVER="https://cloudflare-dns.com/dns-query",t.DNSQuery=async function(e){const t=new URL(e.server);t.search=new URLSearchParams({name:e.question,type:e.type}).toString();const r=await fetch(t.toString(),{headers:{accept:"application/dns-json"}});return 200!==r.status?(console.log("Query URL: ",t.toString()),console.log(r.statusText),{Status:-1,TC:!1,AD:!1,RD:!1,RA:!1,Question:[],Answer:[]}):await r.json()}},147:(e,t)=>{"use strict";function r(e,t=200,r){const o=new Headers({"content-type":"application/json; charset=UTF-8"});return r&&r.forEach((e=>{o.append(e[0],e[1])})),new Response(JSON.stringify(e),{status:t,headers:o})}function o(e,t=500){return r({Error:e},t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MiddlewareJSONCheck=t.JSONErrorResponse=t.JSONResponse=void 0,t.JSONResponse=r,t.JSONErrorResponse=o,t.MiddlewareJSONCheck=e=>{if(!(e.headers.get("content-type")||"").includes("application/json"))return o("Not a JSON Body",400)}}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var s=t[o]={exports:{}};return e[o](s,s.exports,r),s.exports}(()=>{"use strict";const e=r(923),t=r(470),o=r(147),n=r(473),s=(0,t.Router)();s.get("/",(()=>new Response("Homepage for DNS API. Nothing here right now but there are other endpoints. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api"))),s.get("/nameservers/used",n.GetUsedDNSServer),s.get("/nameservers/all",n.DNSCryptInfo),s.get("/query",o.MiddlewareJSONCheck,e.queryEndpoint),s.all("*",(()=>new Response("404, not found!",{status:404}))),addEventListener("fetch",(e=>{e.respondWith(s.handle(e.request))}))})()})();