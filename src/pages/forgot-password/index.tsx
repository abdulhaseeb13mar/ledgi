import { useState } from "react";

import kamelHisaabLogo from "@/assets/svgs/kamel-hisaab-primary.svg";
import { auth } from "@/lib/firebase";
import { Link, useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("If an account exists for this email, a reset link has been sent.");
      navigate({ to: "/login" });
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/user-not-found") {
          toast.success("If an account exists for this email, a reset link has been sent.");
          navigate({ to: "/login" });
          return;
        }

        if (error.code === "auth/too-many-requests") {
          toast.error("Too many attempts. Please try again later.");
          return;
        }
      }

      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <img src={kamelHisaabLogo} alt="Kamel Hisaab" className="mx-auto h-12 w-auto" />
        <p className="mt-2 text-sm text-gray-500">Enter your email and we&apos;ll send you a password reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5f59f7] focus:ring-2 focus:ring-[#5f59f7]/20"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#5f59f7] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4e48e0] disabled:opacity-50"
        >
          {loading ? "Sending reset link..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link to="/login" className="font-medium text-[#0159f8]">
          Sign In
        </Link>
      </p>
    </div>
  );
}
