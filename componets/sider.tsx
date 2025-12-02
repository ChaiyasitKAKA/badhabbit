'use client';

import { Home, Plus, Settings, User, LogOut, Repeat, PieChart } from 'lucide-react'; 
import { supabase } from '@/utils/supabaseclient'
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link'; 


interface Profile {
    Name: string;
    user_image_url: string;
}


const navItems = [
    { name: 'Dashboard', icon: Home, link: '/dashboard' },
    { name: 'New Habit', icon: Plus, link: '/habits' }, 
    { name: 'Profile Settings', icon: User, link: '/accounts' },
];

const Sidebar = () => {
    const router = useRouter();    
    const pathname = usePathname();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    
    const signOut = async () => {
      await supabase.auth.signOut();
      router.push("/");
    };

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !user) {
                    router.push('/signup'); 
                    return;
                }

                const { data: profileData, error: profileError } = await supabase
                    .from('user_tb') 
                    .select('Name, user_image_url')   
                    .eq('id', user.id)
                    .single();
                    
                if (profileError && profileError.code !== 'PGRST116') {
                    console.error(profileError);
                }
                
                setProfile(profileData || null);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    
    if (loading) {
        return (
            <div className="hidden md:flex w-72 bg-gray-900 flex-col items-center justify-center h-screen fixed left-0 top-0 border-r border-gray-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        
        <aside className="hidden md:flex fixed top-0 left-0 z-50 w-72 bg-gray-900 text-gray-100 flex-col h-screen p-5 shadow-2xl border-r border-gray-800 transition-all duration-300">
            
            {/* Logo Section */}
            <div className="flex items-center mb-10 px-2 py-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg mr-3">
                    <Repeat className="w-6 h-6 text-emerald-500 rotate-45"/>
                </div>
                <h1 className="text-2xl font-extrabold tracking-wider text-white">
                    HABIT <span className="text-emerald-500">TRACKER</span>
                </h1>
            </div>
            
            {/* User Profile Card */}
            <div className="mb-8 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/50 shadow-lg">
                    <img
                        src={profile?.user_image_url || 'https://placehold.co/60x60/374151/D1D5DB?text=U'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-emerald-400 truncate">
                        {profile?.Name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        Welcome back
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link
                            key={item.name}
                            href={item.link}
                            className={`
                                group flex items-center py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                ${isActive 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }
                            `}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white/30 rounded-r-full" />
                            )}
                            
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-emerald-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-800">
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium group"
                >
                    <LogOut className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
            
        </aside>
    );
};

export default Sidebar;