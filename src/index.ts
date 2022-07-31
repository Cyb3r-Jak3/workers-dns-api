import { queryEndpoint } from './dns-query'

import { Router } from 'itty-router'
import { MiddlewareJSONCheck } from './utils'
import { DNSCryptInfoEndpoint, GetUsedDNSServerEndpoint } from './dns-servers'
import { WHOISEndpoint, RegistryInfoURLEndpoint, GetRegistryRDAPInfoEndpoint, GetRegistrarRDAPEndpoint } from './whois'

export let BASE: string

if (PRODUCTION === 'true') {
  BASE = '/api/'
} else {
  BASE = '/'
}
const router = Router({ base: `${BASE}` })

router.get('', () => {
  return new Response(
    'Homepage for DNS API. The is the index page. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api',
  )
})

router.get('nameservers/used', GetUsedDNSServerEndpoint)

router.get('nameservers/all', DNSCryptInfoEndpoint)

router.get('query', MiddlewareJSONCheck, queryEndpoint)
router.get('whois', WHOISEndpoint)
router.get('registry/:tld', RegistryInfoURLEndpoint)
router.get('rdap/registry/:domain', GetRegistryRDAPInfoEndpoint)
router.get('rdap/registrar/:domain', GetRegistrarRDAPEndpoint)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
