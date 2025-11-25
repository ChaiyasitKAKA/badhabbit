'use client';
import React, {useState} from "react";
import { supabase } from "@/utils/supabaseclient";
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setmsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setmsg('');
  

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email : email,
      password : password,
    });

    if (error) {
      throw error;
    }

    setmsg('Login successful! ');
    window.location.href = '/dashboard'; 

  }catch (error: unknown) {
    console.error('Login error:',error);
    let errorMsg = 'an unexpected error occurred.';

    if (error instanceof Error) {
      errorMsg = error.message;
    }
  }finally{
    setEmail('');
    setPassword('');
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="absolute -bottom-32 right-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

      <main className="w-full max-w-lg relative z-10">
        
        {/* Navbar เล็กๆ สำหรับกดกลับหน้าแรก */}
        <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-80 transition-opacity">
                Habbit
            </Link>
        </div>

        {/* Card Login ของคุณ (ปรับ Style ให้เข้ากับ Theme นิดหน่อย แต่โครงสร้างเดิม) */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/60 text-center w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 uppercase tracking-wide mb-6">
            Login
          </h1>
          
          {msg && (
            <div className={`p-3 mb-4 text-sm rounded-lg ${msg.startsWith('Login failed') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                />
            </div>

            <div className="text-left">
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                  </span>
              ) : 'Login'}
            </button>

            <h1 className="text-gray-600 mt-6 text-sm"> Don&apos;t have an account? <Link href="/singup" className="text-green-600 font-bold hover:underline">Register</Link>
            </h1>
          </form>
        </div>
      </main>
    </div>
  );
}