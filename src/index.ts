import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { queryEndpoint } from './dns-query'

// import { Router } from 'itty-router'
import { DNSCryptInfoEndpoint, GetUsedDNSServerEndpoint } from './dns-servers'
import {
  WHOISEndpoint,
  RegistryInfoURLEndpoint,
  GetRegistryRDAPInfoEndpoint,
  GetRegistrarRDAPEndpoint,
} from './whois'

// export let BASE: string

// if (PRODUCTION === 'true') {
//   BASE = '/api/'
// } else {
//   BASE = '/'
// }

interface ENV {
  KV: KVNamespace
  PRODUCTION: 'false' | 'true'
}

const app = new Hono<ENV>()

app.use('*', logger())

app.get('', () => {
  return new Response(
    "'Landing page for DNS API. The is the index page. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api'",
  )
})

app.get('nameservers/used', GetUsedDNSServerEndpoint)

app.get('nameservers/all', DNSCryptInfoEndpoint)

app.get('query', queryEndpoint)
app.get('whois', WHOISEndpoint)
app.get('registry/:tld', RegistryInfoURLEndpoint)
app.get('rdap/registry/:domain', GetRegistryRDAPInfoEndpoint)
app.get('rdap/registrar/:domain', GetRegistrarRDAPEndpoint)

app.all('*', () => new Response('404, not found!', { status: 404 }))

export default app
