'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarComponent() {
  const [date, setDate] = useState<Date | null>(new Date()); 

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">ปฏิทิน</h2>
      <Calendar
        onChange={(value) => setDate(value as Date)}
        value={date}
      />
      <p className="mt-2">วันที่ที่เลือก: {date?.toDateString()}</p>
    </div>
  );
}
