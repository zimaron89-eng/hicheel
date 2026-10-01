import React, { useState, useEffect } from 'react';
import { Globe, Clock } from 'lucide-react';

interface TimeZone {
  label: string;
  zone: string;
  flag: string;
}

const TIMEZONES: TimeZone[] = [
  { label: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, flag: '📍' },
  { label: 'New York', zone: 'America/New_York', flag: '🇺🇸' },
  { label: 'London', zone: 'Europe/London', flag: '🇬🇧' },
  { label: 'Paris', zone: 'Europe/Paris', flag: '🇫🇷' },
  { label: 'Dubai', zone: 'Asia/Dubai', flag: '🇦🇪' },
  { label: 'Mumbai', zone: 'Asia/Kolkata', flag: '🇮🇳' },
  { label: 'Singapore', zone: 'Asia/Singapore', flag: '🇸🇬' },
  { label: 'Tokyo', zone: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: 'Sydney', zone: 'Australia/Sydney', flag: '🇦🇺' },
];

function getTimeInZone(zone: string): { time: string; date: string; period: string } {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: zone,
  }).format(now);
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: zone,
  }).format(now);
  const hour = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: zone,
  }).format(now);
  const h = parseInt(hour, 10);
  const period = h < 6 ? 'Night' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
  return { time: timeStr, date: dateStr, period };
}

function getOffsetLabel(zone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  return offsetPart?.value || '';
}

export const WorldClock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-[#161618] border border-gray-800 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">World Clock</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TIMEZONES.map((tz) => {
          const { time, date, period } = getTimeInZone(tz.zone);
          const offset = getOffsetLabel(tz.zone);
          const isLocal = tz.label === 'Local';
          return (
            <div
              key={tz.label}
              className={`p-3.5 rounded-xl border transition-colors ${
                isLocal
                  ? 'bg-indigo-500/10 border-indigo-500/20'
                  : 'bg-[#121214] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{tz.flag}</span>
                  <span className="text-xs font-semibold text-gray-200">{tz.label}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{offset}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white tabular-nums tracking-tight">{time}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-gray-400">{date}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-400 font-medium">{period}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
