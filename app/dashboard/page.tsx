'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import Sider from "@/componets/sider";
import { 
  Flame, 
  Clock, 
  Target, 
  CheckCircle, 
  CheckSquare, 
  Plus, 
  Calendar,
  Edit3,
  Trash2,
  Menu
} from "lucide-react";
import { format } from "date-fns"; 

interface Habit {
  id: string;
  title: string;
  description: string | null;
  color: string | null; 
  icon: string | null;
  goal_frequency: string | null;
  created_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  check: CheckCircle,
  flame: Flame,
  target: Target,
  clock: Clock
};

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (habitsError) console.log("Error fetching habits:", habitsError);
      setHabits(habitsData || []);

      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const { data: completionsData } = await supabase
        .from('completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completion_date', todayDate);

      if (completionsData) {
        const completedSet = new Set(completionsData.map(c => c.habit_id));
        setCompletedHabits(completedSet as Set<string>);
      }
      
      // คำนวณ Streak 
      const allStreaks: Record<string, number> = {};
      const { data: allCompletions } = await supabase
        .from('completions')
        .select('habit_id, completion_date')
        .eq('user_id', user.id);
        
      if (allCompletions) {
          const completionsByHabit = allCompletions.reduce((acc, completion) => {
              const habitId = completion.habit_id;
              if (!acc[habitId]) acc[habitId] = [];
              acc[habitId].push(completion.completion_date);
              return acc;
          }, {} as Record<string, string[]>);

          habitsData?.forEach(habit => {
              const dates = completionsByHabit[habit.id] || [];
              allStreaks[habit.id] = calculateStreak(dates);
          });
          setStreaks(allStreaks);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCheckin = async (habitId: string) => {
    if (!userId) return;
    setCheckingIn(habitId);

    try {
      const todayDate = format(new Date(), "yyyy-MM-dd");

      // Insert into completions
      const { error: compError } = await supabase
        .from("completions")
        .insert({
          habit_id: habitId,
          user_id: userId,
          completion_date: todayDate,
        });

      if (compError) {
        console.log("Completion error:", compError);
        return;
      }

      // Reload completions for this habit
      const { data: habitCompletions } = await supabase
        .from("completions")
        .select("completion_date")
        .eq("habit_id", habitId)
        .eq("user_id", userId);

      const dates = (habitCompletions || []).map((c) => c.completion_date);

      const currentStreak = calculateStreak(dates);

      // Calculate max streak
      const maxStreak = calculateMaxStreak(dates);

      // Calculate success rate
      const totalDays = getTotalDays(dates);
      const successRate = totalDays > 0 ? dates.length / totalDays : 0;

      // Does habit_stat_tb already exist?
      const { data: existingStat } = await supabase
        .from("habit_stat_tb")
        .select("*")
        .eq("habit_id", habitId)
        .limit(1)
        .maybeSingle();

      if (existingStat) {
        // UPDATE habit_stat_tb
        await supabase.from("habit_stat_tb")
          .update({
            current_streak: currentStreak,
            max_streak: maxStreak,
            success_rate: successRate,
            last_completion_date: todayDate,
          })
          .eq("habit_id", habitId);
      } else {
        // INSERT new row
        await supabase.from("habit_stat_tb")
          .insert({
            habit_id: habitId,
            current_streak: currentStreak,
            max_streak: maxStreak,
            success_rate: successRate,
            last_completion_date: todayDate,
          });
      }

      // Update UI streak
      setStreaks(prev => ({
        ...prev,
        [habitId]: currentStreak,
      }));

      setCompletedHabits(prev => new Set(prev).add(habitId));

    } catch (err) {
      console.log(err);
    } finally {
      setCheckingIn(null);
    }
  };

  const calculateStreak = (completionDates: string[]) => {
    if (completionDates.length === 0) return 0;

    const toDay = (d: string) => {
      const date = new Date(d);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const dates = completionDates
      .map(d => toDay(d).getTime())
      .sort((a, b) => b - a);

    let streak = 1;
    let prev = dates[0];

    for (let i = 1; i < dates.length; i++) {
      const diffDays = (prev - dates[i]) / (1000 * 60 * 60 * 24);

      if (diffDays >= 1 && diffDays < 2) {
        streak++;
        prev = dates[i];
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateMaxStreak = (completionDates: string[]) => {
    if (!completionDates || completionDates.length === 0) return 0;

    const toDay = (d: string) => {
      const date = new Date(d);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const dates = completionDates
      .map(d => toDay(d).getTime())
      .sort((a, b) => a - b); // oldest → newest

    let maxStreak = 1;
    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);

      if (diff >= 1 && diff < 2) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    return maxStreak;
  };

  const getTotalDays = (completionDates: string[]) => {
    if (!completionDates || completionDates.length === 0) return 0;

    const toDay = (d: string) => {
      const date = new Date(d);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const dates = completionDates.map(d => toDay(d).getTime()).sort();

    const first = dates[0];
    const last = dates[dates.length - 1];

    const diffDays = (last - first) / (1000 * 60 * 60 * 24);

    return Math.max(1, Math.floor(diffDays) + 1);
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm("Delete this habit?")) return;
    setCheckingIn(habitId);
    try {
      await supabase.from("completions").delete().eq("habit_id", habitId);
      await supabase.from("habit_stat_tb").delete().eq("habit_id", habitId);
      await supabase.from("habits").delete().eq("id", habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(null);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-yellow-50 via-green-50 to-teal-100 font-sans overflow-hidden">
      <Sider />

      {/* Mobile Menu */}
      <div className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white/80 rounded-lg shadow-sm">
        <Menu size={24} className="text-gray-600" />
      </div>

      <main className="flex-1 p-4 sm:p-8 md:pl-72 relative z-10 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Calendar size={16} /> {format(new Date(), "EEEE, d MMMM yyyy")}
              </p>
            </div>
            <button
              onClick={() => router.push("/habits")}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all font-bold"
            >
              <Plus size={20} /> New Habit
            </button>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => {
              const Icon = iconMap[habit.icon || "check"] || CheckCircle;
              const isCompleted = completedHabits.has(habit.id); 
              const isLoadingThis = checkingIn === habit.id; 
              const currentStreak = streaks[habit.id] || 0;
              const themeColor = habit.color || "#10b981"; 

              return (
                <div
                  key={habit.id}
                  className={`relative group flex flex-col justify-between p-6 rounded-3xl backdrop-blur-md bg-white/80 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                    ${isCompleted ? 'opacity-80' : ''}`}
                  style={{ borderColor: isCompleted ? 'transparent' : `${themeColor}40`, borderWidth: '1px' }} 
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors duration-300`}
                        style={{ 
                            backgroundColor: isCompleted ? '#f3f4f6' : themeColor,
                            color: isCompleted ? '#9ca3af' : '#ffffff'
                        }}
                    >
                        <Icon className="w-6 h-6" />
                    </div>

                    {/* Edit/Delete Menu */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => router.push(`/edithabits/${habit.id}`)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-blue-500 shadow-sm"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(habit.id)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-red-500 shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="mb-6">
                    <h2 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {habit.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 h-10">
                        {habit.description}
                    </p>
                  </div>

                  {/* Stats & Button */}
                  <div className="mt-auto space-y-4">
                    
                    {/* Badge Stats */}
                    <div className="flex items-center gap-3">
                         <div className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold flex items-center gap-1 border border-orange-100">
                            <Flame size={12} className="fill-orange-500" />
                            {currentStreak} Day Streak
                         </div>
                    </div>

                    {/* Check-in Button */}
                    <button
                        onClick={() => handleCheckin(habit.id)}
                        disabled={isCompleted || isLoadingThis}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md text-white`}
                        style={{ 
                            backgroundColor: isCompleted ? '#d1d5db' : themeColor,
                            boxShadow: isCompleted ? 'none' : `0 4px 12px ${themeColor}60`
                        }}
                    >
                        {isLoadingThis ? (
                             <span className="animate-pulse">Saving...</span>
                        ) : isCompleted ? (
                            <>
                                <CheckCircle size={20} /> Completed
                            </>
                        ) : (
                            <>
                                <CheckSquare size={20} /> Check-in
                            </>
                        )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
