import { queryEndpoint } from './dns-query'

import { Router } from 'itty-router'
import { MiddlewareJSONCheck } from './utils'
import { DNSCryptInfo, GetUsedDNSServer } from './dns-servers'
import { WHOIS, RegistryInfoURL, GetRegistryRDAPInfo , GetRegistrarRDAP } from './whois'

export let BASE: string

if (PRODUCTION === 'true') {
  BASE = '/api/'
} else {
  BASE = '/'
}
const router = Router({ base: `${BASE}` })

router.get('', () => {
  return new Response(
    'Homepage for DNS API. Nothing here right now but there are other endpoints. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api',
  )
})

router.get('nameservers/used', GetUsedDNSServer)

router.get('nameservers/all', DNSCryptInfo)

router.get('query', MiddlewareJSONCheck, queryEndpoint)
router.get('whois', WHOIS)
router.get('registry/:tld', RegistryInfoURL)
router.get('rdap/registry/:domain', GetRegistryRDAPInfo)
router.get('rdap/registrar/:domain', GetRegistrarRDAP)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
