'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import Sider from "@/componets/sider";
import { Flame, Clock, Target, CheckCircle, CheckSquare } from "lucide-react";
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
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set()); // 🟢 เก็บ ID ของที่ทำเสร็จแล้ววันนี้
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null); // เก็บ ID ตัวที่กำลังหมุน Loading
  const [userId, setUserId] = useState<string | null>(null); // เก็บ User ID
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. หา User ID ก่อน
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (!user) {
        setLoading(false);
        return;
      }

      // 2. ดึงรายการ Habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (habitsError) console.log("Error fetching habits:", habitsError);
      const loadedHabits = habitsData || [];
      setHabits(loadedHabits);

      // 3. ดึงข้อมูลว่า "วันนี้" ทำอะไรเสร็จไปแล้วบ้าง?
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const { data: completionsData, error: completionsError } = await supabase
        .from('completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completion_date', todayDate);

      if (!completionsError) {
        const completedSet = new Set((completionsData || []).map(c => c.habit_id));
        setCompletedHabits(completedSet as Set<string>);
      }
      
      // 4. ⭐ เพิ่มส่วนนี้: คำนวณ Streak เริ่มต้นสำหรับนิสัยทั้งหมด ⭐
      const allStreaks: Record<string, number> = {};
      
      // ดึง completions ทั้งหมดของผู้ใช้ (ไม่ต้องดึงทีละ Habit)
      const { data: allCompletions, error: allCompError } = await supabase
        .from('completions')
        .select('habit_id, completion_date')
        .eq('user_id', user.id);
        
      if (!allCompError && allCompletions) {
          // จัดกลุ่มวันที่ทำสำเร็จตาม habitId
          const completionsByHabit: Record<string, string[]> = allCompletions.reduce((acc, completion) => {
              const habitId = completion.habit_id;
              if (!acc[habitId]) {
                  acc[habitId] = [];
              }
              acc[habitId].push(completion.completion_date);
              return acc;
          }, {} as Record<string, string[]>);

          // คำนวณ streak สำหรับแต่ละ Habit
          loadedHabits.forEach(habit => {
              const dates = completionsByHabit[habit.id] || [];
              const calculatedStreak = calculateStreak(dates);
              allStreaks[habit.id] = calculatedStreak;
          });
          
          setStreaks(allStreaks);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

 const handleCheckin = async (habitId: string) => {
  if (!userId) return;

  setCheckingIn(habitId); // เริ่ม Loading

  try {
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    // Insert completion
    const { error } = await supabase
      .from('completions')
      .insert({
        habit_id: habitId,
        user_id: userId,
        completion_date: todayDate,
      });

    if (error) {
      console.log('Error saving completion:', error);
      alert('Failed to check in.');
    } else {
      // อัปเดต UI ให้ทันที
      setCompletedHabits(prev => new Set(prev).add(habitId));

      // ดึง completions ของ habit ตัวนี้ทั้งหมด
      const { data: habitCompletions, error: compError } = await supabase
        .from('completions')
        .select('completion_date')
        .eq('user_id', userId)
        .eq('habit_id', habitId);

      if (!compError && habitCompletions) {
        const dates = habitCompletions.map(c => c.completion_date);
        const newStreak = calculateStreak(dates);
        setStreaks(prev => ({ ...prev, [habitId]: newStreak }));
      }
    }
  } catch (err) {
    console.log(err);
    alert('Something went wrong.');
  } finally {
    setCheckingIn(null);
  }
};

// ฟังก์ชันคำนวณ streak
const calculateStreak = (completionDates: string[]) => {
  if (completionDates.length === 0) return 0;

  const dates = completionDates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  let prevDate = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const diff = (prevDate.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      prevDate = dates[i];
    } else {
      break;
    }
  }

  return streak;
};


 const handleDelete = async (habitId: string) => {
  const confirmDel = confirm("Are you sure? This action cannot be undone.");
  if (!confirmDel) return;

  setCheckingIn(habitId);

  try {
    // 1️⃣ ลบ completions ของ habit
    const { error: delCompErr } = await supabase
      .from("completions")
      .delete()
      .eq("habit_id", habitId);

    if (delCompErr) {
      alert("Failed to delete completions: " + delCompErr.message);
      return;
    }

    // 2️⃣ ลบ habit_stat_tb ของ habit
    const { error: delStatErr } = await supabase
      .from("habit_stat_tb")
      .delete()
      .eq("habit_id", habitId);

    if (delStatErr) {
      alert("Failed to delete habit stats: " + delStatErr.message);
      return;
    }

    // 3️⃣ ลบ habit เอง
    const { error: delHabitErr } = await supabase
      .from("habits")
      .delete()
      .eq("id", habitId);

    if (delHabitErr) {
      alert("Failed to delete habit: " + delHabitErr.message);
      return;
    }

    // อัปเดต UI
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletedHabits(prev => {
      const newSet = new Set(prev);
      newSet.delete(habitId);
      return newSet;
    });

    alert("Habit deleted!");
    router.push("/dashboard");
  } catch (err) {
    console.error(err);
    alert("Something went wrong while deleting habit.");
  } finally {
    setCheckingIn(null);
  }
};


  if (loading) return <p className="p-4">Loading...</p>;

const inputClassName = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-md hover:shadow-lg hover:-translate-y-0.5";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 font-sans relative overflow-hidden">

      {/* === BACKGROUND LAYERS === */}
      {/* 1. Radial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none z-0"></div>
      
      {/* 2. Blobs (Now visible behind Sider too because Sider is transparent) */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none z-0"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000 pointer-events-none z-0"></div>

      <Sider />

      <main className="flex-1 p-6 bg-gray-50">
        <div className="p-6 space-y-4">

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Habits</h1>
            <button
              onClick={() => router.push("/habits")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
            >
              Add Habit
            </button>
          </div>


          {habits.length === 0 && (
            <p className="text-gray-500">No habits found.</p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {habits.map((habit) => {
              const Icon = iconMap[habit.icon || "check"] || CheckCircle;
              const isCompleted = completedHabits.has(habit.id); 
              const isLoadingThis = checkingIn === habit.id; 

              return (
                <div
                  key={habit.id}
                  className={`p-4 border rounded-xl shadow-sm bg-white transition-all ${isCompleted ? 'border-green-400 bg-green-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    {/* ส่วนแสดงข้อมูล Habit */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-gray-800'}`} />
                        <h2 className={`text-lg font-semibold ${isCompleted ? 'text-green-700 line-through' : ''}`}>
                            {habit.title}
                        </h2>
                      </div>

                      {habit.description && (
                        <p className="text-gray-600 mb-2">{habit.description}</p>
                      )}

                      {habit.goal_frequency && (
                        <p className="text-sm text-blue-600">
                          Frequency: {habit.goal_frequency}
                        </p>
                      )}
                      <p className="text-sm text-purple-600">
  🔥 Streak: {streaks[habit.id] || 0} day{streaks[habit.id] > 1 ? 's' : ''}
</p>


                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(habit.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* ปุ่ม Action */}
                    <div className="flex flex-col gap-2">
                         {/* ปุ่ม Check-in */}
                        <button
                            onClick={() => handleCheckin(habit.id)}
                            disabled={isCompleted || isLoadingThis}
                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition
                                ${isCompleted 
                                    ? 'bg-green-100 text-green-700 cursor-default' 
                                    : 'bg-gray-100 hover:bg-green-500 hover:text-white text-gray-700'
                                }
                            `}
                        >
                            {isLoadingThis ? (
                                <span>Saving...</span>
                            ) : isCompleted ? (
                                <>
                                    <CheckCircle size={16} /> Done
                                </>
                            ) : (
                                <>
                                    <CheckSquare size={16} /> Check-in
                                </>
                            )}
                        </button>
                        
                        {/* ปุ่ม Edit เดิม */}
                        <a
                            href={`/edithabits/${habit.id}`}
                            className="text-sm px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-center"
                        >
                            Edit
                        </a>
                        <button
  onClick={() => handleDelete(habit.id)}
  className="text-sm px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200"
>
  Delete
</button>
                    </div>
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