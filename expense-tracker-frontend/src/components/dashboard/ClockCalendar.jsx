import { useState, useEffect } from 'react';
import { getDualCalendarInfo } from '../../utils/nepaliDate';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

export default function ClockCalendar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { englishDateString, nepaliDateString } = getDualCalendarInfo(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Live Time Display */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Live Kathmandu Time</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-mono">
          {formattedTime}
        </div>
      </div>

      {/* Dual English & Nepali Calendar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-50 px-5 py-3.5 rounded-2xl w-full md:w-auto">
        <div className="p-2.5 bg-white rounded-xl shadow-2xs text-zinc-700 hidden sm:block">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block animate-pulse"></span>
            {nepaliDateString}
          </div>
          <div className="text-xs font-medium text-zinc-500">
            {englishDateString} (AD)
          </div>
        </div>
      </div>
    </div>
  );
}