'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseclient";
import { useRouter, useParams } from "next/navigation";
import Sider from "@/componets/sider";


export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams(); 
  const habitId = params?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  const [icon, setIcon] = useState("");
  const [goalFrequency, setGoalFrequency] = useState("Daily");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // โหลดข้อมูล habit
  useEffect(() => {
    if (!habitId) return;

    const fetchHabit = async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", habitId)
        .single();

      if (error) {
        console.error(error);
        alert("Failed to load habit.");
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setColor(data.color || "#000000");
      setIcon(data.icon || "");
      setGoalFrequency(data.goal_frequency);
      setLoading(false);
    };

    fetchHabit();
  }, [habitId]);

  // อัปเดต habit
  const handleSave = async () => {
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
      return;
    }

    alert("Updated successfully!");
    router.push("/dashboard");
  };

  


  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex min-h-screen">
      <Sider />

      <div className="max-w-md mx-auto mt-10 p-5 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Habit</h2>

        <input
          type="text"
          placeholder="Habit Title"
          className="w-full p-2 border rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Habit Description"
          className="w-full p-2 border rounded mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block font-semibold mb-1">Pick Color</label>
        <input
          type="color"
          className="w-full h-12 p-1 border rounded mb-3"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <label className="block font-semibold">Frequency</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={goalFrequency}
          onChange={(e) => setGoalFrequency(e.target.value)}
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        <input
          type="text"
          placeholder="Icon (e.g. 🧘‍♂️)"
          className="w-full p-2 border rounded mb-3"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white p-2 rounded mb-3"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        
      </div>
    </div>
  );
}
