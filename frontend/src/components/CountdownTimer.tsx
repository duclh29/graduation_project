import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  targetHours?: number; // hours from now
}

const pad = (n: number) => String(n).padStart(2, "0");

const CountdownTimer = ({ targetHours = 8 }: CountdownTimerProps) => {
  const [target] = useState(() => {
    const t = new Date();
    t.setHours(t.getHours() + targetHours, 0, 0, 0);
    return t.getTime();
  });

  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-center gap-2">
      <Timer size={15} className="text-white/70" />
      <span className="text-xs font-medium text-white/60">Kết thúc sau:</span>
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-black/30 px-1.5 text-sm font-black text-white tabular-nums">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white/50 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
};

export default CountdownTimer;
