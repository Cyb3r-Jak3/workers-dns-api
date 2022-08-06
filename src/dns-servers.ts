import { DNSCRYPT_RESOLVERS } from './dns-utils'
import { HandleCachedResponse, JSONErrorResponse, JSONResponse } from './utils'
import { Context } from 'hono'

const cache = caches.default

const DNS_CRYPT_INFO_URL =
  'https://download.dnscrypt.info/dnscrypt-resolvers/json/public-resolvers.json'

export async function DNSCryptInfoEndpoint(): Promise<Response> {
  return await DNSCRYPT_RESPONSE()
}

export async function GetUsedDNSServerEndpoint(c: Context): Promise<Response> {
  let resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  let servers: DNSCRYPT_RESOLVERS[] | null = await c.env.KV.get('DoH_SERVERS', {
    type: 'json',
  })
  if (servers === null) {
    const list: DNSCRYPT_RESOLVERS[] = await (await DNSCRYPT_RESPONSE()).json()
    let usedDNSServer: DNSCRYPT_RESOLVERS[] = []
    list.forEach((server) => {
      if (server.nofilter && server.proto === 'DoH') {
        usedDNSServer.push(server)
      }
    })
    servers = usedDNSServer
    await c.env.KV.put('DoH_SERVERS', JSON.stringify(usedDNSServer), {
      expirationTtl: 86400,
    })
  }
  resp = JSONResponse(servers, 200, [['Cache-Control', '86400']])
  await cache.put(c.req, resp.clone())
  return resp
}

async function DNSCRYPT_RESPONSE(): Promise<Response> {
  let resp = await cache.match(DNS_CRYPT_INFO_URL)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  const result = await fetch(DNS_CRYPT_INFO_URL, {
    headers: { accept: 'application/json' },
  })
  if (result.status !== 200) {
    console.error(result.statusText)
    return JSONErrorResponse('Error getting upstream info')
  }
  resp = JSONResponse(await result.json())
  await cache.put(DNS_CRYPT_INFO_URL, resp.clone())
  return resp
}
