import { QueryRequest } from './dns-query'

export const DEFAULT_DOH_SERVER = 'https://cloudflare-dns.com/dns-query'

export interface DNSQuestion {
  name: string
  type: number
}

export interface DNSAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

export interface DNSResponse {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  Question: { name: string; type: number }[]
  Answer: DNSAnswer[]
}

export interface DNSCRYPT_RESOLVERS {
  addrs: string[]
  country: string
  description: string
  dnssec: boolean
  ipv6: boolean
  location: { lat: number; long: number }
  name: string
  nofilter: boolean
  nolog: boolean
  ports: number[]
  proto: string
  stamp: string
}

export async function DNSQuery(query: QueryRequest): Promise<DNSResponse> {
  const queryURL = new URL(query.server)
  queryURL.search = new URLSearchParams({
    name: query.question,
    type: query.type,
  }).toString()
  const results = await fetch(queryURL.toString(), {
    headers: { accept: 'application/dns-json' },
  })
  if (results.status !== 200) {
    console.log('Query URL: ', queryURL.toString())
    console.log(results.statusText)
    return {
      Status: -1,
      TC: false,
      AD: false,
      RD: false,
      RA: false,
      Question: [],
      Answer: [],
    }
  }
  const dnsResults: DNSResponse = await results.json()
  return dnsResults
}
