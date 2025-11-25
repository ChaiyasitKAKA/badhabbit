'use client';
import { useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import { useRouter } from "next/navigation";
import Sider from '@/componets/sider'
import { Flame, Clock, Target, CheckCircle } from "lucide-react";

export default function AddHabit() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("check");
  const [goalFrequency, setGoalFrequency] = useState("Daily");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const iconOptions = [
    { key: "check", icon: CheckCircle },
    { key: "flame", icon: Flame },
    { key: "target", icon: Target },
    { key: "clock", icon: Clock },
  ];

  const handleAddHabit = async () => {
    if (!title) {
      alert("Please enter a habit title!");
      return;
    }
    setLoading(true);

    const user = (await supabase.auth.getSession()).data.session?.user;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase.from("habits").insert([
      {
        title,
        goal_frequency: goalFrequency,
        description,
        color,
        icon,
        user_id: user.id,
      }
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to add habit!");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sider />

      <div className="flex-1 flex justify-center items-start pt-16 px-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl">

          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Create New Habit
          </h2>

          {/* Title */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">Habit Title</label>
            <input
              type="text"
              className="w-full p-3 border rounded-xl mt-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">Description</label>
            <textarea
              className="w-full p-3 border rounded-xl mt-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Color Picker */}
          <div className="mb-5">
            <label className="font-semibold text-gray-700">Color</label>
            <div className="w-full mt-2 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-lg border shadow"
              />
              <span className="text-gray-600">{color}</span>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700">Select Icon</label>
            <div className="grid grid-cols-4 gap-4 mt-3">
              {iconOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setIcon(opt.key)}
                    className={`p-3 rounded-xl border 
                      ${icon === opt.key ? "bg-indigo-600 text-white" : "bg-gray-100"} 
                      flex justify-center items-center transition hover:scale-105`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700">Goal Frequency</label>
            <select
              className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
              value={goalFrequency}
              onChange={(e) => setGoalFrequency(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Button */}
          <button
            onClick={handleAddHabit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-3 rounded-2xl text-lg font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Adding..." : "Create Habit"}
          </button>

        </div>
      </div>
    </div>
  );
}
