import { DNSCRYPT_RESOLVERS } from './dns-utils'
import { JSONErrorResponse, JSONResponse } from './utils'

const DNS_CRYPT_INFO_URL =
  'https://download.dnscrypt.info/dnscrypt-resolvers/json/public-resolvers.json'

export async function DNSCryptInfo(): Promise<Response> {
  return await DNSCRYPT_RESPONSE()
}

export async function GetUsedDNSServer(): Promise<Response> {
  let servers: DNSCRYPT_RESOLVERS[] | null = await KEYS.get('DoH_SERVERS', {
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
    await KEYS.put('DoH_SERVERS', JSON.stringify(usedDNSServer), {
      expirationTtl: 86400,
    })
  }
  return JSONResponse(servers)
}

async function DNSCRYPT_RESPONSE(): Promise<Response> {
  const cache = caches.default
  let response = await cache.match(DNS_CRYPT_INFO_URL)
  if (!response) {
    const result = await fetch(DNS_CRYPT_INFO_URL, {
      headers: { accept: 'application/json' },
    })
    if (result.status !== 200) {
      console.error(result.statusText)
      return JSONErrorResponse('Error getting upstream info')
    }
    response = JSONResponse(await result.json())
    cache.put(DNS_CRYPT_INFO_URL, response.clone())
  }
  return response
}
