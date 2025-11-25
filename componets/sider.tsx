'use client';
import { Home, Plus, Repeat, Settings, User } from 'lucide-react'; 
import { supabase } from '@/utils/supabaseclient'
import React, { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

    interface profile {
    Name: string;
    user_image_url: string;
}

const Sidebar = () => {

    //sing out function naja
const router = useRouter();    
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  router.push("/singup");
};

const navItems = [
  { name: 'Dashboard', icon: Home, link: '/dashboard' },
  { name: 'Habits', icon: Plus, link: '/habits' },
  { name: 'Accounts', icon: User, link: '/accounts' },
];
//state for profile data
const [profile, setProfile] = useState<profile | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(true);

//setstate for active nav item
const pathname = usePathname();

//fetch profile data
useEffect(() => {
    const fetchData = async () => {
        try {
            const {data: {session}, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                window.location.href = 'singup';
                return;
            }
            const user = session.user;

            const {data: profileData, error: profileError } = await supabase
                .from('user_tb') 
                .select('Name, user_image_url')   
                .eq('id', user.id)
                .single();
                
                if (profileError) {
                    throw profileError;
                }
                setProfile(profileData);
        }catch (error: unknown) {
            let errorMassage = 'An unexpected error occurred.';
            if (error instanceof Error) {
                errorMassage = error.message;
            }
             setError(errorMassage);
        }finally {
            setLoading(false);
        }
    };
    fetchData();
}, []);

if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-semibold">Loading ...</p></div>;
    }

if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-red-50"><p className="text-xl text-red-600">Error: {error}</p></div>;
    }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen p-6">
      
      {/* --- 1. Profile Section --- */}
      <div className="mb-10 relative ">
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
          <img
                src={profile?.user_image_url || 'https://placehold.co/60x60/E2E8F0/4A5568?text=User'}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
            />
          <div className="w-full h-full bg-gray-700"></div> 
        </div>
        
        <h1 className="text-xl font-semibold">
            {profile?.Name || 'Guest User'}
        </h1>
        <p className="text-sm text-gray-400">
            Welcome back!
        </p>
      </div>

        {/* --- 2. Navigation Items --- */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.link}
            className={`
              flex items-center py-3 px-4 rounded-lg text-lg font-medium transition duration-150 ease-in-out
              ${pathname === item.link 
  ? 'bg-gray-800 text-white' 
  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
}
            `}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* --- 3. Sign Out Button --- */}
      <button
        onClick={signOut}
        className="py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition font-medium cursor-pointer"
      >
        Sign Out
      </button>
      
    </div>
  );
};

export default Sidebar;