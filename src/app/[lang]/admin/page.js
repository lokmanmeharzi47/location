"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("adminAuth", "true");
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden text-white">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border border-gold-500/30 rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-semibold text-xs tracking-wider uppercase mb-2">
            Administration
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            لوحة التحكم
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-3"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm transition-all"
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm transition-all"
              placeholder="أدخل كلمة المرور"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
