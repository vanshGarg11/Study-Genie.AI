import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E1116] px-5 text-[#ECEEF3]">
      <div className="w-full max-w-md border border-[#262B34] bg-[#12161D] p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#14B8A6]">
          Account recovery
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Password reset is not enabled yet.</h1>
        <p className="mt-4 text-sm leading-6 text-[#A8AFBE]">
          Email reset needs a mail service before it can work. For now, ask the
          project admin to reset your account or create a new account.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center bg-[#3F3D9E] px-4 py-3 font-semibold text-white"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
