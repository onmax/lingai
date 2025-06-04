import process from 'node:process'
import { D1Dialect } from '@atinux/kysely-d1'
import { betterAuth } from 'better-auth'
import { admin, anonymous } from 'better-auth/plugins'

let _auth: ReturnType<typeof betterAuth>
export function serverAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: {
        dialect: new D1Dialect({
          // @ts-expect-error types error
          database: hubDatabase(),
        }),
        type: 'sqlite',
      },
      secondaryStorage: {
        get: key => hubKV().getItemRaw(`_auth:${key}`),
        set: (key, value, ttl) => {
          return hubKV().set(`_auth:${key}`, value, { ttl })
        },
        delete: key => hubKV().del(`_auth:${key}`),
      },
      baseURL: getBaseURL(),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
      account: {
        accountLinking: {
          enabled: true,
        },
      },
      plugins: [anonymous(), admin()],
    })
  }
  return _auth
}

function getBaseURL() {
  let baseURL = process.env.BETTER_AUTH_URL
  if (!baseURL) {
    try {
      baseURL = getRequestURL(useEvent()).origin
    }
    catch {}
  }
  return baseURL
}
