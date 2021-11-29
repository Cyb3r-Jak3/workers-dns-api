/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/itty-router/dist/itty-router.min.js":
/*!**********************************************************!*\
  !*** ./node_modules/itty-router/dist/itty-router.min.js ***!
  \**********************************************************/
/***/ ((module) => {

module.exports={Router:({base:t="",routes:l=[]}={})=>({__proto__:new Proxy({},{get:(e,a,o)=>(e,...r)=>l.push([a.toUpperCase(),RegExp(`^${(t+e).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+)(\?)?(\.)?/g,"$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/,"\\.")}/*$`),r])&&o}),routes:l,async handle(e,...r){let a,o,t=new URL(e.url);e.query=Object.fromEntries(t.searchParams);for(var[p,s,u]of l)if((p===e.method||"ALL"===p)&&(o=t.pathname.match(s))){e.params=o.groups;for(var c of u)if(void 0!==(a=await c(e.proxy||e,...r)))return a}}})};


/***/ }),

/***/ "./src/dns-query.ts":
/*!**************************!*\
  !*** ./src/dns-query.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.queryEndpoint = void 0;
const dns_utils_1 = __webpack_require__(/*! ./dns-utils */ "./src/dns-utils.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
async function queryEndpoint(req) {
    const query = await req.json();
    if (query.server === undefined) {
        query.server = dns_utils_1.DEFAULT_DOH_SERVER;
    }
    if (query.question === undefined || query.type === undefined) {
        return utils_1.JSONErrorResponse("Need both'question', and 'type' set", 400);
    }
    const DNSResult = await dns_utils_1.DNSQuery(query);
    if (DNSResult.Status === -1) {
        return utils_1.JSONErrorResponse('Error getting DNS Response');
    }
    return utils_1.JSONResponse(DNSResult);
}
exports.queryEndpoint = queryEndpoint;


/***/ }),

/***/ "./src/dns-servers.ts":
/*!****************************!*\
  !*** ./src/dns-servers.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUsedDNSServer = exports.DNSCryptInfo = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
const DNS_CRYPT_INFO_URL = 'https://download.dnscrypt.info/dnscrypt-resolvers/json/public-resolvers.json';
async function DNSCryptInfo() {
    return await DNSCRYPT_RESPONSE();
}
exports.DNSCryptInfo = DNSCryptInfo;
async function GetUsedDNSServer() {
    const cache = caches.default;
    let response = await cache.match('https://dns-api.cyberjake.xyz/AvailableDNSServers');
    if (!response) {
        const list = await (await DNSCRYPT_RESPONSE()).json();
        const usedDNSServer = [];
        list.forEach((server) => {
            if (server.nofilter && server.proto === 'DoH') {
                usedDNSServer.push(server);
            }
        });
        response = utils_1.JSONResponse(usedDNSServer, undefined, [
            ['Cache-Control', 'max-age=43200, must-revalidate'],
        ]);
        cache.put(DNS_CRYPT_INFO_URL, response.clone());
    }
    return response;
}
exports.GetUsedDNSServer = GetUsedDNSServer;
async function DNSCRYPT_RESPONSE() {
    const cache = caches.default;
    let response = await cache.match(DNS_CRYPT_INFO_URL);
    if (!response) {
        const result = await fetch(DNS_CRYPT_INFO_URL, {
            headers: { accept: 'application/json' },
        });
        if (result.status !== 200) {
            console.error(result.statusText);
            return utils_1.JSONErrorResponse('Error getting upstream info');
        }
        response = utils_1.JSONResponse(await result.json());
        cache.put(DNS_CRYPT_INFO_URL, response.clone());
    }
    return response;
}


/***/ }),

/***/ "./src/dns-utils.ts":
/*!**************************!*\
  !*** ./src/dns-utils.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DNSQuery = exports.DEFAULT_DOH_SERVER = void 0;
exports.DEFAULT_DOH_SERVER = 'https://cloudflare-dns.com/dns-query';
async function DNSQuery(query) {
    const queryURL = new URL(query.server);
    queryURL.search = new URLSearchParams({
        name: query.question,
        type: query.type,
    }).toString();
    const results = await fetch(queryURL.toString(), {
        headers: { accept: 'application/dns-json' },
    });
    if (results.status !== 200) {
        console.log('Query URL: ', queryURL.toString());
        console.log(results.statusText);
        return {
            Status: -1,
            TC: false,
            AD: false,
            RD: false,
            RA: false,
            Question: [],
            Answer: [],
        };
    }
    const dnsResults = await results.json();
    return dnsResults;
}
exports.DNSQuery = DNSQuery;


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JSONErrorResponse = exports.JSONResponse = void 0;
function JSONResponse(ResponseData, status = 200, extra_headers) {
    const send_headers = new Headers({
        'content-type': 'application/json; charset=UTF-8',
    });
    if (extra_headers) {
        extra_headers.forEach((element) => {
            send_headers.append(element[0], element[1]);
        });
    }
    return new Response(JSON.stringify(ResponseData), {
        status: status,
        headers: send_headers,
    });
}
exports.JSONResponse = JSONResponse;
function JSONErrorResponse(errMessage, status = 500) {
    return JSONResponse({ Error: errMessage }, status);
}
exports.JSONErrorResponse = JSONErrorResponse;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const dns_query_1 = __webpack_require__(/*! ./dns-query */ "./src/dns-query.ts");
const itty_router_1 = __webpack_require__(/*! itty-router */ "./node_modules/itty-router/dist/itty-router.min.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
const dns_servers_1 = __webpack_require__(/*! ./dns-servers */ "./src/dns-servers.ts");
const router = itty_router_1.Router();
const MiddlewareJSONCheck = (request) => {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return utils_1.JSONErrorResponse('Not a JSON Body', 400);
    }
};
router.get('/', () => {
    return new Response('Hello, world! This is the root page of your Worker template.');
});
router.get('/nameservers/used', dns_servers_1.GetUsedDNSServer);
router.get('/nameservers/all', dns_servers_1.DNSCryptInfo);
// router.get('/nameservers/info', nameServerInfo)
router.get('/query', MiddlewareJSONCheck, dns_query_1.queryEndpoint);
router.all('*', () => new Response('404, not found!', { status: 404 }));
addEventListener('fetch', (e) => {
    e.respondWith(router.handle(e.request));
});

})();

/******/ })()
;
//# sourceMappingURL=worker.js.map