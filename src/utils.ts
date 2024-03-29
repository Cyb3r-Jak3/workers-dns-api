import { BASE } from './index'

export function JSONResponse(
  ResponseData: string | unknown,
  status = 200,
  extra_headers?: string[][],
): Response {
  const send_headers = new Headers({
    'content-type': 'application/json; charset=UTF-8',
  })
  if (extra_headers) {
    extra_headers.forEach((element) => {
      send_headers.append(element[0], element[1])
    })
  }
  return new Response(JSON.stringify(ResponseData), {
    status: status,
    headers: send_headers,
  })
}

export function JSONErrorResponse(errMessage: string, status = 500): Response {
  return JSONResponse({ Error: errMessage }, status)
}

export const MiddlewareJSONCheck = (request: Request): Response | undefined => {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return JSONErrorResponse('Not a JSON Body', 400)
  }
}

export function CleanBase(fullURL: string, stripPart: string): string {
  // return new URL(fullURL).pathname.replace(`/${stripPart}/`, '')

  return new URL(fullURL).pathname.replace(`${BASE}${stripPart}/`, '')
}

/**
 *
 * @param resp Response that hit cache
 * @returns Response with X-Worker-Cache Header
 */

export function HandleCachedResponse(resp: Response): Response {
  const newHeaders = new Headers(resp.headers)
  newHeaders.set('X-Worker-Cache', 'HIT')
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: newHeaders,
  })
}
