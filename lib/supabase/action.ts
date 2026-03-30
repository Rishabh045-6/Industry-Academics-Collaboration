'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEMO_EMAIL, DEMO_ROLE_COOKIE, DEMO_SCOPE_COOKIE, ROLES, isRoleKey } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const cookieStore = await cookies()

  const selectedRole = String(formData.get('role') ?? '')
  const selectedDemoScope = String(formData.get('demo_scope') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!isRoleKey(selectedRole)) {
    redirect('/login?error=missing_role')
  }

  if (!email || !password) {
    redirect('/login?error=missing_credentials')
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login redirect reason', {
      reason: 'sign_in_error',
      submittedEmail: email,
      message: error.message,
    })
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  const authCookieNames = cookieStore
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.startsWith('sb-'))
  const signedInUser = signInData.user
  const signedInSession = signInData.session
  const authUserResult = signedInUser
    ? { data: { user: signedInUser }, error: null }
    : await supabase.auth.getUser()
  const user = authUserResult.data.user

  console.info('Login auth resolution', {
    submittedEmail: email,
    signInUserId: signedInUser?.id ?? null,
    signInUserEmail: signedInUser?.email ?? null,
    hasSession: Boolean(signedInSession),
    sessionUserId: signedInSession?.user?.id ?? null,
    authUserId: user?.id ?? null,
    authUserEmail: user?.email ?? null,
    authUserError: authUserResult.error?.message ?? null,
    authCookieNames,
  })

  if (!user) {
    console.error('Login redirect reason', {
      reason: 'missing_auth_user_after_sign_in',
      submittedEmail: email,
      signInUserId: signedInUser?.id ?? null,
      signInUserEmail: signedInUser?.email ?? null,
      hasSession: Boolean(signedInSession),
      authUserError: authUserResult.error?.message ?? null,
    })
    await supabase.auth.signOut()
    cookieStore.delete(DEMO_ROLE_COOKIE)
    cookieStore.delete(DEMO_SCOPE_COOKIE)
    redirect('/login?error=missing_profile')
  }

  const { data: profileById, error: profileByIdError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileByIdError) {
    console.error('Login profile lookup by id failed', {
      userId: user.id,
      email: user.email ?? null,
      code: profileByIdError.code,
      message: profileByIdError.message,
      details: profileByIdError.details,
      hint: profileByIdError.hint,
    })
  } else if (!profileById) {
    console.warn('Login profile lookup by id returned no row', {
      userId: user.id,
      email: user.email ?? null,
    })
  }

  const { data: profile, error: profileError } = profileById
    ? { data: profileById, error: null }
    : user.email
      ? await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', user.email)
          .maybeSingle()
      : { data: null, error: null }

  if (!profileById && profile) {
    console.warn('Resolved login profile by email fallback', {
      userId: user.id,
      profileId: profile.id,
      email: user.email ?? null,
    })
  } else if (!profileById && profileError) {
    console.error('Login profile lookup by email failed', {
      userId: user.id,
      email: user.email ?? null,
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
    })
  }

  console.info('Login profile query result', {
    userId: user.id,
    email: user.email ?? null,
    profileId: profile?.id ?? null,
    profileEmail: profile?.email ?? null,
    profileRole: profile?.role ?? null,
    profileError: profileError?.message ?? null,
    profileLookupRan: true,
  })

  if (profileError || !profile) {
    console.warn('Login continuing without immediate profile resolution', {
      userId: user.id,
      email: user.email ?? null,
      profileError: profileError?.message ?? null,
    })
    cookieStore.delete(DEMO_ROLE_COOKIE)
    cookieStore.delete(DEMO_SCOPE_COOKIE)
    console.info('Login redirect reason', {
      reason: 'dashboard_after_sign_in_without_immediate_profile',
      userId: user.id,
      email: user.email ?? null,
    })
    console.info('Login redirect reason', {
      reason: 'dashboard_after_demo_sign_in',
      userId: user.id,
      email: user.email ?? null,
    })
    redirect('/dashboard')
  }

  if (user.email === DEMO_EMAIL) {
    const roleUsesDemoScope =
      selectedRole === ROLES.DEPARTMENT_COORDINATOR ||
      selectedRole === ROLES.INSTITUTE_COORDINATOR ||
      selectedRole === ROLES.CAMPUS_COORDINATOR ||
      selectedRole === ROLES.DEPUTY_DIRECTOR

    console.info('Login demo override resolution', {
      userId: user.id,
      email: user.email ?? null,
      selectedRole,
      selectedDemoScope: selectedDemoScope || null,
      roleUsesDemoScope,
    })

    cookieStore.set(DEMO_ROLE_COOKIE, selectedRole, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    if (roleUsesDemoScope && selectedDemoScope) {
      cookieStore.set(DEMO_SCOPE_COOKIE, selectedDemoScope, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    } else {
      cookieStore.delete(DEMO_SCOPE_COOKIE)
    }

    redirect('/dashboard')
  }

  cookieStore.delete(DEMO_ROLE_COOKIE)
  cookieStore.delete(DEMO_SCOPE_COOKIE)

  if (profile.role !== selectedRole) {
    console.error('Login redirect reason', {
      reason: 'role_mismatch',
      userId: user.id,
      email: user.email ?? null,
      profileRole: profile.role,
      selectedRole,
    })
    await supabase.auth.signOut()
    redirect('/login?error=role_mismatch')
  }

  console.info('Login redirect reason', {
    reason: 'dashboard_after_successful_sign_in',
    userId: user.id,
    email: user.email ?? null,
    profileRole: profile.role,
  })
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  const cookieStore = await cookies()
  await supabase.auth.signOut()
  cookieStore.delete(DEMO_ROLE_COOKIE)
  cookieStore.delete(DEMO_SCOPE_COOKIE)
  redirect('/login')
}



