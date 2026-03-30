import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getRequiredEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            console.info('Supabase cookie setAll', {
              cookieNames: cookiesToSet.map(({ name }) => name),
              cookieCount: cookiesToSet.length,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error('Supabase cookie setAll failed', {
              message: error instanceof Error ? error.message : String(error),
              cookieNames: cookiesToSet.map(({ name }) => name),
              cookieCount: cookiesToSet.length,
            })
          }
        },
      },
    }
  )
}

