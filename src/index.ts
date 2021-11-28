import { queryEndpoint } from './dns-query'

import { Router } from 'itty-router'
import { JSONErrorResponse } from './utils'
import { DNSCryptInfo, GetUsedDNSServer } from './dns-servers'

const router = Router()

const MiddlewareJSONCheck = (request: Request) => {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return JSONErrorResponse('Not a JSON Body', 400)
  }
}

router.get('/', () => {
  return new Response(
    'Hello, world! This is the root page of your Worker template.',
  )
})

router.get('/nameservers/used', GetUsedDNSServer)

router.get('/nameservers/all', DNSCryptInfo)

// router.get('/nameservers/info', nameServerInfo)

router.get('/query', MiddlewareJSONCheck, queryEndpoint)

router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
