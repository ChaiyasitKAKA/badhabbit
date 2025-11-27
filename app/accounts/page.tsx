'use client'
    

import Sider from '@/componets/sider'
import { supabase } from '@/utils/supabaseclient'
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

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
          window.location.href = '/signup';  
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
  }, []);

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
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading Account...</p>
      </div>
    );
  }

  const inputClassName = "w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 font-sans relative overflow-hidden"  >

      {/* === BACKGROUND LAYERS === */}
      {/* 1. Radial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none z-0">

      </div>
      
      {/* 2. Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none z-0">
      </div>
      
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none z-0">

      </div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none z-0">

      </div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000 pointer-events-none z-0">

      </div>

      <Sider />

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 md:pl-72 transition-all duration-300 relative z-10">
      
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/60">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 uppercase tracking-wide mb-8 text-center">
            User Account
          </h1>

          {error && (
            <div
              className={`p-3 mb-4 text-sm rounded-lg ${
                error.startsWith('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {error}
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSave}>
            <div className="flex flex-col items-center w-full mb-4">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg mb-4">
                <img
                  src={imagePreview || 'https://placehold.co/150x150/E2E8F0/4A5568?text=Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="text-sm font-medium text-gray-700 mb-2 cursor-pointer bg-gray-100 py-2 px-4 rounded-full hover:bg-gray-200 transition-colors">
                Change Profile Picture
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="w-full text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={account?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border-gray-300 rounded-lg cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div className="w-full text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-center mt-6 ">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-1/2 bg-emerald-500 text-white font-bold py-3 rounded-full hover:bg-emerald-600 disabled:bg-gray-400 cursor-pointer transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
