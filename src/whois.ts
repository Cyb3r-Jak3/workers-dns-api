// 1. GET DNS JSON https://data.iana.org/rdap/dns.json
// 2. Talk to domain owner https://rdap.centralnic.com/xyz/domain/cyberjake.xyz
// 3. Talk to domain name server https://rdap.cloudflare.com/rdap/v1/domain/cyberjake.xyz

import { Context } from 'hono'
import {
  CleanBase,
  HandleCachedResponse,
  JSONErrorResponse,
  JSONResponse,
} from './utils'

// application/rdap+json || application/json
// const testDomain = 'cyberjake.xyz'
const cache = caches.default
const RDAP_IANA_URL = 'https://data.iana.org/rdap/dns.json'

export interface INANA_RESPONSE {
  description: string
  publication: string
  version: string
  services: string[][][]
}

export interface RegistryRDAP {
  objectClassName: string
  handle: string
  ldhName: string
  nameservers: Nameserver[]
  secureDNS: SecureDNS
  entities: Entity[]
  status: string[]
  whois43: string
  events: Event[]
  notices: Notice[]
  links: EntityLink[]
  rdapConformance: string[]
  lang: string
}

export interface Entity {
  objectClassName: string
  vcardArray: Array<Array<Array<Array<string[] | string> | string>> | string>
  status?: string[]
  remarks?: Notice[]
  roles: string[]
  handle?: string
  entities?: EntityEntity[]
  links?: EntityLink[]
  publicIds?: PublicID[]
}

export interface EntityEntity {
  objectClassName: string
  handle: string
  roles: string[]
  vcardArray: Array<Array<Array<PurpleVcardArray | string>> | string>
}

export interface PurpleVcardArray {
  type?: string
}

export interface EntityLink {
  rel?: string
  href: string
  type?: string
  title?: string
}

export interface PublicID {
  type: string
  identifier: string
}

export interface Notice {
  title: string
  type?: Type
  description: string[]
  links?: NoticeLink[]
}

export interface NoticeLink {
  title: string
  href: string
}

export enum Type {
  ObjectRedactedDueToAuthorization = 'object redacted due to authorization',
  ObjectTruncatedDueToAuthorization = 'Object truncated due to authorization',
  TypeObjectTruncatedDueToAuthorization = 'object truncated due to authorization',
}

export interface Event {
  eventAction: string
  eventDate: Date
}

export interface Nameserver {
  objectClassName: string
  ldhName: string
  status: string[]
  links: EntityLink[]
}

export interface SecureDNS {
  delegationSigned: boolean
  maxSigLife: number
  dsData: DsDatum[]
}

export interface DsDatum {
  keyTag: number
  algorithm: number
  digest: string
  digestType: number
}

const WHOIS_INFO_KEY = 'WHOIS_INFO'

// Get the full WHOIS registry list
async function getWHOISInfo(KV: KVNamespace): Promise<INANA_RESPONSE | null> {
  let servers: INANA_RESPONSE | null = await KV.get(WHOIS_INFO_KEY, {
    type: 'json',
  })
  if (!servers) {
    const data = await fetch(RDAP_IANA_URL, {
      headers: {
        'content-type': 'application/json',
      },
    })
    servers = await data.json()
    await KV.put(WHOIS_INFO_KEY, JSON.stringify(servers), {
      expirationTtl: 600,
    })
  }
  return servers
}

// Get the URL of the registry for a top level domain
async function GetTLDContactURL(
  tld: string,
  KV: KVNamespace,
): Promise<string | null> {
  let contactURL = await KV.get(tld)
  if (!contactURL) {
    const toParse = await getWHOISInfo(KV)
    if (!toParse) {
      return null
    }
    for (const service of toParse.services) {
      if (service[0].find((e) => e == tld)) {
        contactURL = service[1][0]
        await KV.put(tld, contactURL)
        break
      }
    }
  }
  return contactURL
}

// Get the RDAP info from the domain registry
async function GetRegistryRDAP(
  url: string,
  to_strip: string,
  KV: KVNamespace,
): Promise<RegistryRDAP | null> {
  const domain = CleanBase(url, to_strip)
  const tld = domain.split('.').at(-1)

  if (!domain || !tld) {
    console.error('Did not get domain or TLD')
    return null
    // return JSONResponse({Error: `Unable to get TLD for '${domain}`}, 400)
  }
  const contactURL = await GetTLDContactURL(tld, KV)
  if (!contactURL) {
    console.error('Did not get contact URL')
    return null
  }
  const RDAPResponse = await fetch(
    `${contactURL}/domain/${domain}`.replace(/([^:])(\/\/+)/g, '$1/'),
    {
      headers: {
        'content-type': 'application/rdap+json',
        Accept: 'application/json, application/rdap+json',
      },
    },
  )
  return await RDAPResponse.json()
}

export async function WHOISEndpoint(c: Context): Promise<Response> {
  let resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  resp = JSONResponse(await getWHOISInfo(c.env.KV), 200, [
    ['Cache-Control', '3600'],
  ])
  await cache.put(c.req, resp.clone())
  return resp
}

export async function RegistryInfoURLEndpoint(c: Context): Promise<Response> {
  let resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  const tld = CleanBase(c.req.url, 'registry')
  const contactURL = await GetTLDContactURL(tld, c.env.KV)
  if (!contactURL) {
    resp = JSONResponse(
      {
        Error: `Registrar for TLD : '${tld}' not found. Please double check the TLD`,
      },
      400,
      [['Cache-Control', '86440']],
    )
  } else {
    resp = new Response(contactURL, { headers: { 'Cache-Control': '3600' } })
  }
  await cache.put(c.req, resp.clone())
  return resp
}

export async function GetRegistryRDAPInfoEndpoint(
  c: Context,
): Promise<Response> {
  let resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  const r = await GetRegistryRDAP(c.req.url, 'rdap/registry', c.env.KV)
  if (!r) {
    return JSONErrorResponse('Error getting RDAP response data', 500)
  }
  resp = JSONResponse(r)
  await cache.put(c.req, resp.clone())
  return resp
}

export async function GetRegistrarRDAPEndpoint(c: Context): Promise<Response> {
  let resp = await cache.match(c.req)
  if (resp) {
    return HandleCachedResponse(resp)
  }
  const rdap_data = await GetRegistryRDAP(c.req.url, 'rdap/registrar', c.env.KV)
  if (!rdap_data) {
    return JSONErrorResponse('Error getting RDAP data')
  }
  for (const link of rdap_data.links) {
    if (link.title === "URL of Sponsoring Registrar's RDAP Record") {
      console.log(link.href)
      return JSONResponse(link.href)
    }
  }
  resp = JSONResponse(rdap_data, 404)
  // const data: RegistryRDAP = await r.json()
  // resp = JSONResponse(r)
  return resp
}
