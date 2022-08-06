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

export let BASE: string

interface ENV {
  KV: KVNamespace
  PRODUCTION: 'false' | 'true'
}

export default {
  async fetch(request: Request, env: ENV, ctx: ExecutionContext) {
    if (env.PRODUCTION === 'true') {
      BASE = '/api/'
    } else {
      BASE = '/'
    }
    const app = new Hono<ENV>()
    const route = new Hono()
    route.use('*', logger())

    route.get('', () => {
      return new Response(
        'Landing page for DNS API. The is the index page. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api',
      )
    })

    route.get('nameservers/used', GetUsedDNSServerEndpoint)

    route.get('nameservers/all', DNSCryptInfoEndpoint)

    route.get('query', queryEndpoint)
    route.get('whois', WHOISEndpoint)
    route.get('registry/:tld', RegistryInfoURLEndpoint)
    route.get('rdap/registry/:domain', GetRegistryRDAPInfoEndpoint)
    route.get('rdap/registrar/:domain', GetRegistrarRDAPEndpoint)

    route.all('*', () => new Response('404, not found!', { status: 404 }))
    app.route(BASE, route)
    return app.fetch(request, env, ctx)
  },
}
