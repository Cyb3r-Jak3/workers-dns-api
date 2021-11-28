import { DNSQuery, DEFAULT_DOH_SERVER } from './dns-utils'
import { JSONErrorResponse, JSONResponse } from './utils'

export interface QueryRequest {
  server: string
  type: string
  question: string
}

export async function queryEndpoint(req: Request): Promise<Response> {
  const query: QueryRequest = await req.json()
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
  return JSONResponse(DNSResult)
}
