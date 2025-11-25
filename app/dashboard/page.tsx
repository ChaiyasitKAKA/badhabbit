'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import Sider from "@/componets/sider";
import { Flame, Clock, Target, CheckCircle } from "lucide-react";
import comcalender from "@/componets/cakebder";

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log("Error fetching habits:", error);
      } else {
        setHabits(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  




  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="flex min-h-screen">
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

              return (
                <div
                  key={habit.id}
                  className="p-4 border rounded-xl shadow-sm bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-6 h-6 text-gray-800" />
                    <h2 className="text-lg font-semibold">{habit.title}</h2>
                  </div>

                  {habit.description && (
                    <p className="text-gray-600 mb-2">{habit.description}</p>
                  )}

                  {habit.goal_frequency && (
                    <p className="text-sm text-blue-600">
                      Frequency: {habit.goal_frequency}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(habit.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
  <a
    href={`/edithabits/${habit.id}`}
    className="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg"
  >
    Edit
  </a>
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
