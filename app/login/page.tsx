import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-12 animate-fadeIn">
      <Link href="/" className="mb-8 text-2xl font-extrabold tracking-tight text-ink">
        <span className="text-primary">LIFE</span>IFY
      </Link>
      <div className="lif-card p-6">
        <div className="mb-4 rounded-xl border border-primary/40 bg-primary-soft/50 p-3 text-center">
          <p className="text-xs font-bold text-primary-dark">⚡ Test Mode Active</p>
          <p className="text-[11px] text-ink-soft mb-2">Login system has been bypassed for rapid testing.</p>
          <Link
            href="/app/dashboard"
            className="lif-btn-primary w-full py-2 text-xs font-bold text-center block shadow-xs"
          >
            Launch Dashboard Directly ➔
          </Link>
        </div>
        <h1 className="text-xl font-bold text-ink">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">Log in with your phone number or email.</p>
        <AuthForm mode="login" />
      </div>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New to LIFEIFY?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
