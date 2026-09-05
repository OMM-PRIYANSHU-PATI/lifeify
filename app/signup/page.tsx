import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-12 animate-fadeIn">
      <Link href="/" className="mb-8 text-2xl font-extrabold tracking-tight text-ink">
        <span className="text-primary">LIFE</span>IFY
      </Link>
      <div className="lif-card p-6">
        <h1 className="text-xl font-bold text-ink">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">
          One place to track, understand, and manage your whole health picture.
        </p>
        <AuthForm mode="signup" />
        <p className="mt-4 text-xs text-ink-soft">
          By signing up you agree to our Terms and Privacy Policy. LIFEIFY is a wellness platform
          and does not provide medical diagnosis or treatment.
        </p>
      </div>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
