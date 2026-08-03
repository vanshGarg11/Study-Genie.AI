import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E1116] px-5 text-[#ECEEF3]">
      <div className="w-full max-w-md border border-[#262B34] bg-[#12161D] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-[#E8556B]">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold">This StudyGenie page does not exist.</h1>
        <p className="mt-4 text-sm leading-6 text-[#A8AFBE]">
          The link may be old, incomplete, or typed incorrectly.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex w-full items-center justify-center bg-[#4C6FFF] px-4 py-3 font-semibold text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
