export const sessionCookie = 'adonis-session'
const xsrfCookie = 'XSRF-TOKEN'

export function setCookie(response: { header(name: string): unknown }, name: string): string {
  const cookies = response.header('set-cookie')
  const cookie = (Array.isArray(cookies) ? cookies : [cookies]).find(
    (entry): entry is string => typeof entry === 'string' && entry.startsWith(`${name}=`),
  )
  if (!cookie) {
    throw new Error(`Missing ${name} cookie`)
  }
  return cookie
}

export function cookiePair(cookie: string) {
  return cookie.split(';', 1)[0]
}

export function csrfHeaders(response: { header(name: string): unknown }) {
  const xsrf = cookiePair(setCookie(response, xsrfCookie))
  return {
    Cookie: cookiePair(setCookie(response, sessionCookie)),
    'X-XSRF-TOKEN': decodeURIComponent(xsrf.slice(xsrfCookie.length + 1)),
  }
}
