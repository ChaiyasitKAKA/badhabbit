'use client'

import Sider from '@/componets/sider'
import { supabase } from '@/utils/supabaseclient'
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { User, Mail, Camera, Save, X, Loader2, Lock } from 'lucide-react'; 

interface AccountProps {
  id: string;
  Name: string;
  user_image_url: string;
  email: string;
}

export default function Accounts() {
  const [account, setAccount] = useState<AccountProps | null>(null);
  const [Name, setName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          router.push('/signup'); // ใช้ router.push แทน window.location เพื่อ UX ที่ดีกว่า
          return;
        }

        const user = session.user;

        const { data: accountData, error: accountError } = await supabase
          .from('user_tb')
          .select('*')
          .eq('id', user.id)
          .single();

        if (accountError) {
          setError(accountError.message);
          return; 
        }

        setAccount(accountData);
        setName(accountData.Name || '');
        setImagePreview(accountData.user_image_url || null);

      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!account) return;

    try {
      let imageUrl = account.user_image_url;

      if (imageFile) {
        const fileName = `${account.id}/${uuidv4()}`;
        const { error: uploadError } = await supabase.storage
          .from('user_bk')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          setIsSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage.from('user_bk').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { data, error: updateError } = await supabase
        .from('user_tb')
        .update({
          Name,
          user_image_url: imageUrl,
        })
        .eq('id', account.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      setAccount(data);
      setImagePreview(data.user_image_url);
      setImageFile(null);
      setError('Profile updated successfully!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      setIsSaving(false);
    }
  };

  
  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );
  }

  
  const inputClassName = "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 font-sans relative overflow-hidden">

      {/* === BACKGROUND LAYERS === */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none z-0"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000 pointer-events-none z-0"></div>

      <Sider />

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 md:pl-72 transition-all duration-300 relative z-10">
      
        <div className="w-full max-w-xl bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/60 relative">
          
          {/* Close Button */}
          <button 
                onClick={() => router.push('/dashboard')}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
            >
                <X size={24} />
          </button>

          <h1 className="text-3xl font-extrabold text-gray-800 uppercase tracking-wide mb-8 text-center flex items-center justify-center gap-3">
             <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><User size={28} /></span>
             My Profile
          </h1>

          {error && (
            <div
              className={`p-3 mb-6 text-sm rounded-lg flex items-center justify-center gap-2 ${
                error.startsWith('Profile updated')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {error}
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSave}>
            
            {/* Image Upload Section */}
            <div className="flex flex-col items-center w-full mb-6 relative group">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                    <img
                    src={imagePreview || 'https://placehold.co/150x150/E2E8F0/4A5568?text=User'}
                    className="w-full h-full object-cover"
                    alt="Profile"
                    />
                </div>
                
                {/* Floating Camera Button */}
                <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 border-2 border-white">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium">Click the camera icon to update</p>
            </div>

            {/* Email Field (Disabled) */}
            <div className="w-full text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={account?.email || ''}
                    disabled
                    className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Name Field */}
            <div className="w-full text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={Name}
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                    className={inputClassName}
                  />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {isSaving ? (
                   <>
                     <Loader2 className="animate-spin" size={20} /> Saving...
                   </>
                ) : (
                   <>
                     <Save size={20} /> Save Changes
                   </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
}