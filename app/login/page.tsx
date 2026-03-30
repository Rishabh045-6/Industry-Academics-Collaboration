import { DemoLoginForm } from "@/components/demo-login-form";

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_role":
      return "Select your role before signing in.";
    case "missing_credentials":
      return "Enter both your email address and password.";
    case "role_mismatch":
      return "The selected role does not match your assigned profile role. Please choose the correct role and try again.";
    case "missing_profile":
      return "We could not find a profile for this account.";
    default:
      return error ? decodeURIComponent(error) : undefined;
  }
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorParam);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="panel grid max-w-5xl gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <section className="flex flex-col justify-center">
          <p className="eyebrow text-blue-600">Secure access</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            Select a role first, then sign in with the right scope.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Higher-level roles can log in directly. Scoped roles choose their campus, institute, or department first, then enter credentials.
          </p>
        </section>

        <section className="rounded-[28px] bg-slate-900 p-8 text-white">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Account login</p>
            <DemoLoginForm errorMessage={errorMessage} />
          </div>
        </section>
      </div>
    </main>
  );
}

