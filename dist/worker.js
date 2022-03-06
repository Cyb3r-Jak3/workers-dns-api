(()=>{var e={470:e=>{e.exports={Router:({base:e="",routes:t=[]}={})=>({__proto__:new Proxy({},{get:(r,o,s)=>(r,...n)=>t.push([o.toUpperCase(),RegExp(`^${(e+r).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+)(\?)?(\.)?/g,"$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/,"\\.").replace(/\)\.\?\(([^\[]+)\[\^/g,"?)\\.?($1(?<=\\.)[^\\.")}/*$`),n])&&s}),routes:t,async handle(e,...r){let o,s,n=new URL(e.url);for(var[a,i,c]of(e.query=Object.fromEntries(n.searchParams),t))if((a===e.method||"ALL"===a)&&(s=n.pathname.match(i)))for(var u of(e.params=s.groups,c))if(void 0!==(o=await u(e.proxy||e,...r)))return o}})}},923:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.queryEndpoint=void 0;const o=r(279),s=r(147);t.queryEndpoint=async function(e){const t=caches.default;let r=await t.match(e);if(!r){const n=await e.json();if(void 0===n.server&&(n.server=o.DEFAULT_DOH_SERVER),void 0===n.question||void 0===n.type)return(0,s.JSONErrorResponse)("Need both'question', and 'type' set",400);const a=await(0,o.DNSQuery)(n);if(-1===a.Status)return(0,s.JSONErrorResponse)("Error getting DNS Response");r=(0,s.JSONResponse)(a,200,[["Cache-Control",a.Answer[0].TTL.toString()]]),await t.put(e,r.clone())}return r}},473:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.GetUsedDNSServer=t.DNSCryptInfo=void 0;const o=r(147),s="https://download.dnscrypt.info/dnscrypt-resolvers/json/public-resolvers.json";async function n(){const e=caches.default;let t=await e.match(s);if(!t){const r=await fetch(s,{headers:{accept:"application/json"}});if(200!==r.status)return console.error(r.statusText),(0,o.JSONErrorResponse)("Error getting upstream info");t=(0,o.JSONResponse)(await r.json()),await e.put(s,t.clone())}return t}t.DNSCryptInfo=async function(){return await n()},t.GetUsedDNSServer=async function(e){const t=caches.default;let r=await t.match(e);if(!r){let s=await KEYS.get("DoH_SERVERS",{type:"json"});if(null===s){const e=await(await n()).json();let t=[];e.forEach((e=>{e.nofilter&&"DoH"===e.proto&&t.push(e)})),s=t,await KEYS.put("DoH_SERVERS",JSON.stringify(t),{expirationTtl:86400})}r=(0,o.JSONResponse)(s,200,[["Cache-Control","86400"]]),await t.put(e,r.clone())}return r}},279:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DNSQuery=t.DEFAULT_DOH_SERVER=void 0,t.DEFAULT_DOH_SERVER="https://cloudflare-dns.com/dns-query",t.DNSQuery=async function(e){const t=new URL(e.server);t.search=new URLSearchParams({name:e.question,type:e.type}).toString();const r=await fetch(t.toString(),{headers:{accept:"application/dns-json"}});return 200!==r.status?(console.log("Query URL: ",t.toString()),console.log(r.statusText),{Status:-1,TC:!1,AD:!1,RD:!1,RA:!1,Question:[],Answer:[]}):await r.json()}},147:(e,t)=>{"use strict";function r(e,t=200,r){const o=new Headers({"content-type":"application/json; charset=UTF-8"});return r&&r.forEach((e=>{o.append(e[0],e[1])})),new Response(JSON.stringify(e),{status:t,headers:o})}function o(e,t=500){return r({Error:e},t)}Object.defineProperty(t,"__esModule",{value:!0}),t.MiddlewareJSONCheck=t.JSONErrorResponse=t.JSONResponse=void 0,t.JSONResponse=r,t.JSONErrorResponse=o,t.MiddlewareJSONCheck=e=>{if(!(e.headers.get("content-type")||"").includes("application/json"))return o("Not a JSON Body",400)}}},t={};function r(o){var s=t[o];if(void 0!==s)return s.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}(()=>{"use strict";const e=r(923),t=r(470),o=r(147),s=r(473),n=(0,t.Router)({base:"/api"});n.get("/",(()=>new Response("Homepage for DNS API. Nothing here right now but there are other endpoints. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api"))),n.get("/nameservers/used",s.GetUsedDNSServer),n.get("/nameservers/all",s.DNSCryptInfo),n.get("/query",o.MiddlewareJSONCheck,e.queryEndpoint),n.all("*",(()=>new Response("404, not found!",{status:404}))),addEventListener("fetch",(e=>{e.respondWith(n.handle(e.request))}))})()})();