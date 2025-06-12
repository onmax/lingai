import process from 'node:process'
import { D1Dialect } from '@atinux/kysely-d1'
import { betterAuth } from 'better-auth'
import { admin, anonymous } from 'better-auth/plugins'

let _auth: ReturnType<typeof betterAuth>
export function serverAuth() {
  if (!_auth) {
    const config = useRuntimeConfig()
    _auth = betterAuth({
      database: {
        dialect: new D1Dialect({
          database: hubDatabase() as any,
        }),
        type: 'sqlite',
        generateTables: true, // This will auto-create tables if they don't exist
      },
      secondaryStorage: {
        get: key => hubKV().getItemRaw(`_auth:${key}`),
        set: (key, value, ttl) => {
          return hubKV().set(`_auth:${key}`, value, { ttl })
        },
        delete: key => hubKV().del(`_auth:${key}`),
      },
      secret: config.betterAuthSecret,
      baseURL: config.betterAuthUrl || getBaseURL(),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        github: {
          clientId: config.github.clientId,
          clientSecret: config.github.clientSecret,
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
