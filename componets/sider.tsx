'use client';
import { Home, Plus, Settings, User, LogOut, Repeat } from 'lucide-react'; 
import { supabase } from '@/utils/supabaseclient'
import React, { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

// Interface สำหรับข้อมูลโปรไฟล์
interface profile {
    Name: string;
    user_image_url: string;
}

// ข้อมูลเมนู
const navItems = [
    { name: 'Dashboard', icon: Home, link: '/dashboard' },
    { name: 'New Habit', icon: Plus, link: '/habits' },
    { name: 'Profile Settings', icon: User, link: '/accounts' },
];

const Sidebar = () => {
    const router = useRouter();    
    const pathname = usePathname();

    const [profile, setProfile] = useState<profile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // ฟังก์ชัน Sign Out
    const signOut = async () => {
      
      const { error } = await supabase.auth.signOut();
      router.push("/");
    };

    // ฟังก์ชันดึงข้อมูลโปรไฟล์
    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data: {session}, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session?.user) {
                    // Redirect ถ้าไม่มี session หรือ user
                    window.location.href = '/singup'; 
                    return;
                }
                const user = session.user;

                const {data: profileData, error: profileError } = await supabase
                    .from('user_tb') 
                    .select('Name, user_image_url')   
                    .eq('id', user.id)
                    .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') { // 'PGRST116' คือ No rows found
                        throw profileError;
                    }
                    setProfile(profileData || null);
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
        return <div className="w-64 bg-gray-900 flex items-center justify-center h-screen"><p className="text-white">Loading...</p></div>;
    }

    if (error) {
        return <div className="w-64 bg-gray-900 flex items-center justify-center h-screen"><p className="text-red-400 p-4">Error loading profile.</p></div>;
    }

    return (
        <div className="top-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col h-screen p-4 shadow-2xl border-r border-gray-800">
            
            <div className="flex items-center mb-10 py-2">
                <Repeat className="w-6 h-6 text-emerald-400 rotate-45 mr-3"/>
                <h1 className="text-2xl font-extrabold tracking-wider text-white">
                    HABIT <span className="text-emerald-400">TRACKER</span>
                </h1>
            </div>
            
           
            <div className="mb-10 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition">
               
                <div className="w-14 h-14 rounded-full overflow-hidden mb-2 mx-auto">
                    <img
                        src={profile?.user_image_url || 'https://placehold.co/60x60/374151/D1D5DB?text=U'}
                        alt="Profile"
                        className="w-full h-full object-cover border-4 border-emerald-500 shadow-md"
                    />
                </div>
                
                <p className="text-base font-medium text-center text-emerald-400">
                    {profile?.Name || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500 text-center">
                    Welcome back!
                </p>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.link}
                        
                        className={`
                            flex items-center py-3 px-4 rounded-lg text-base font-medium transition duration-200 
                            ${pathname === item.link 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </a>
                ))}
            </nav>

            
            <button
                onClick={signOut}
                className="mt-6 flex items-center justify-center py-3 px-4 rounded-lg bg-red-700 hover:bg-red-600 transition font-medium cursor-pointer text-white shadow-md shadow-red-700/50"
            >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
            </button>
            
        </div>
    );
};

export default Sidebar;