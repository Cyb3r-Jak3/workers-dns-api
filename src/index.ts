import { queryEndpoint } from './dns-query'

import { Router } from 'itty-router'
import { MiddlewareJSONCheck } from './utils'
import { DNSCryptInfo, GetUsedDNSServer } from './dns-servers'

const router = Router()

router.get('/', () => {
  return new Response(
    'Homepage for DNS API. Nothing here right now but there are other endpoints. Checkout the repo: https://github.com/Cyb3r-Jak3/workers-dns-api',
  )
})

router.get('/nameservers/used', GetUsedDNSServer)

router.get('/nameservers/all', DNSCryptInfo)

router.get('/query', MiddlewareJSONCheck, queryEndpoint)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
