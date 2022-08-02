import { Context } from 'hono'
import { DNSQuery, DEFAULT_DOH_SERVER } from './dns-utils'
import { JSONErrorResponse, JSONResponse, MiddlewareJSONCheck } from './utils'
import { HandleCachedResponse } from './utils'
const cache = caches.default

export interface QueryRequest {
  server: string
  type: string
  question: string
}

export async function queryEndpoint(c: Context): Promise<Response> {
  let resp = MiddlewareJSONCheck(c.req)
  if (resp) {
    return resp
  }
  resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  const query: QueryRequest = await c.req.json()
  if (query.server === undefined) {
    query.server = DEFAULT_DOH_SERVER
  }
  if (query.question === undefined || query.type === undefined) {
    return JSONErrorResponse("Need both'question', and 'type' set", 400)
  }
  const DNSResult = await DNSQuery(query)
  if (DNSResult.Status === -1) {
    return JSONErrorResponse('Error getting DNS Response')
  }
  resp = JSONResponse(DNSResult, 200, [
    ['Cache-Control', DNSResult.Answer[0].TTL.toString()],
  ])
  await cache.put(c.req, resp.clone())
  return resp
}
