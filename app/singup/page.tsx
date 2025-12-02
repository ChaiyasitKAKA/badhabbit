'use client';
import {useState} from "react";
import { supabase } from "@/utils/supabaseclient";
import {v4 as uuidv4} from 'uuid';
import Link from 'next/link';
import { Upload } from "lucide-react";

function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        
        typeof (error as { message: unknown }).message === 'string'
    );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [msg, setmsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile || !email || !password || !name) {
      setmsg('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setLoading(true);
    setmsg('');

    try {
      const authResponse = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authResponse.error) {
        throw authResponse.error;
      }

      if (!authResponse.data.user) {
        throw new Error('User data is missing after sign up.');
      }

      const user = authResponse.data.user;
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileNema = `${uuidv4()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('user_bk')
          .upload(fileNema, imageFile); 

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('user_bk')
          .getPublicUrl(fileNema);
        imageUrl = publicUrl;
      }

      const insertResponse = await supabase.from('user_tb').insert({
        id: user.id,
        email: email,
        Name: name,
        user_image_url: imageUrl,
      });
      if (insertResponse.error) throw insertResponse.error;

            setmsg('ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน');
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);

    } catch (error) {
       console.error('Registration error:', error);
      if (isErrorWithMessage(error)) {
        setmsg(error.message);
      } else {
        setmsg('เกิดข้อผิดพลาด ไม่สามารถสมัครสมาชิกได้');
      }
    } finally {
      setLoading(false);
    }
  }
  return (
        <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">

        {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

      <main className="w-full max-w-lg relative z-10"></main>

      {/* Navbar Link */}
        <div className="mb-6 text-center">
            <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-80 transition-opacity">
                Habbit
            </Link>
        </div>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg relative">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 uppercase tracking-wide mb-6 text-center">
                    Register
                </h1>

                {msg && (
                    <div className={`p-3 mb-4 text-sm rounded-lg ${msg?.startsWith('เกิดข้อผิดพลาด') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {msg}
                    </div>
                )}

                <form className="w-full space-y-6" onSubmit={handleSubmit}>

                  {/* Image Upload Section */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative group cursor-pointer">
                        <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${imagePreview ? 'border-green-500' : 'border-dashed border-gray-300'} shadow-inner bg-gray-50 flex items-center justify-center transition-all hover:border-green-400`}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Upload size={24} />
                                    <span className="text-xs mt-1">Photo</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {/* Edit overlay icon */}
                        <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-md transform scale-90 group-hover:scale-110 transition-transform">
                            <Upload size={14} />
                        </div>
                    </div>
                    <label className="text-sm text-gray-500 mt-2 font-medium">Profile Picture</label>
                </div>
                    
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <input
                        type="name "
                        placeholder="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-sm text-gray-600 text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-emerald-500 font-semibold hover:underline text-center ">
                        Login here
                    </a>
                </p>
            </div>
        </main>
    );
}