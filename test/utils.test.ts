import {
  JSONErrorResponse,
  JSONResponse,
  MiddlewareJSONCheck,
} from '../src/utils'
import makeServiceWorkerEnv from 'service-worker-mock'

declare var global: any

describe('JSONResponse', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('200 response', async () => {
    const result = JSONResponse({ Hello: 'World' })
    expect(result.status).toEqual(200)
    expect(result.headers.get('content-type')).toEqual(
      'application/json; charset=UTF-8',
    )
  })
  test('500 response', async () => {
    const result = JSONErrorResponse('I should fail')
    expect(result.status).toEqual(500)
    expect(result.headers.get('content-type')).toEqual(
      'application/json; charset=UTF-8',
    )
  })
})

describe('Middleware Check', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })
  test('Good check', async () => {
    const result = MiddlewareJSONCheck(
      new Request('/', { headers: { 'Content-Type': 'application/json' } }),
    )
    if (result) {
      throw new Error('Got a respond for good middleware check result')
    }
  })

  test('Fail check', async () => {
    const result = MiddlewareJSONCheck(new Request('/'))
    if (!result) {
      throw new Error('Did not get middleware check result')
    }
    expect(result.status).toEqual(400)
  })
})
