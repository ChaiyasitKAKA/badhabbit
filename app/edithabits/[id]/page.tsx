'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import { useRouter, useParams } from "next/navigation";
import Sider from "@/componets/sider";
import { 
  Flame, 
  Clock, 
  Target, 
  CheckCircle, 
  ChevronDown, 
  Settings,
  ArrowLeft 
} from "lucide-react";

export default function EditHabit() {
  const router = useRouter();
  const params = useParams();
  const habitId = params?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("check");
  const [goalFrequency, setGoalFrequency] = useState("Daily");
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); 
  const [success, setSuccess] = useState(false);

  const iconOptions = [
    { key: "check", icon: CheckCircle },
    { key: "flame", icon: Flame },
    { key: "target", icon: Target },
    { key: "clock", icon: Clock },
  ];

  
  useEffect(() => {
    if (!habitId) return;

    const fetchHabit = async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", habitId)
        .single();

      if (error) {
        alert("Failed to load habit.");
        router.push('/dashboard');
        return;
      }

      setTitle(data.title);
      setDescription(data.description || "");
      setColor(data.color || "#6366f1");
      setIcon(data.icon || "check");
      setGoalFrequency(data.goal_frequency || "Daily");

      setLoading(false);
    };

    fetchHabit();
  }, [habitId, router]);

  
  const handleSave = async () => {
    if (!title) return alert("Please enter a habit title!");

    setSaving(true);

    const { error } = await supabase
      .from("habits")
      .update({
        title,
        description,
        color,
        icon,
        goal_frequency: goalFrequency,
      })
      .eq("id", habitId);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Failed to update habit!");
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push("/dashboard");
      }, 1500);
    }
  };

  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit? This action cannot be undone.")) return;

    setDeleting(true);

    try {
        
        await supabase.from("completions").delete().eq("habit_id", habitId);
        
       
        const { error } = await supabase.from("habits").delete().eq("id", habitId);

        if (error) throw error;

        router.push("/dashboard");
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete habit.");
        setDeleting(false);
    }
  };

  const inputClassName =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-md hover:shadow-lg hover:-translate-y-0.5";

  if (loading)
    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 font-sans relative overflow-hidden">

      {/* Radial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none z-0"></div>

      {/* Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob z-0"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 z-0"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000 z-0"></div>

      <Sider />

      <main className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 md:pl-72 relative z-10">

        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-xl relative border border-white/60">

          {/* Header Buttons (Back & Delete) */}
          <div className="flex justify-between items-center absolute top-4 left-4 right-4">
            <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-white/50 rounded-full transition-colors flex items-center gap-1"
            >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>

            
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 uppercase tracking-wide mb-8 mt-6 text-center flex items-center justify-center gap-3">
            <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Settings size={28} />
            </span>
            Edit Habit
          </h1>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habit Title</label>
              <input
                type="text"
                className={inputClassName}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                className={inputClassName}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <div className="flex items-center gap-3 p-2 rounded-lg border border-white/60 bg-white/80 hover:border-emerald-400 transition-all cursor-pointer">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer bg-transparent"
                  />
                  <span className="text-gray-700 font-medium font-mono uppercase tracking-wider">
                    {color}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Frequency</label>
                <div className="relative">
                  <select
                    className={`${inputClassName} appearance-none pr-10 cursor-pointer`}
                    value={goalFrequency}
                    onChange={(e) => setGoalFrequency(e.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Icon</label>
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                {iconOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setIcon(opt.key)}
                      className={`p-3 rounded-lg border flex justify-center items-center transition-all hover:scale-105
                        ${isSelected
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500"}`}
                    >
                      <IconComp className="w-6 h-6" strokeWidth={isSelected ? 2.5 : 2} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 rounded-full text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || success}
                className={`flex-1 text-white py-3 rounded-full text-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70
                  ${success ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : success ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Saved!
                  </span>
                ) : "Save Changes"}
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}